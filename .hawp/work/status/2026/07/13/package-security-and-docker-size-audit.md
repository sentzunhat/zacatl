# Package Security and Docker Size Audit

## Audit Mission

Assess Zacatl's package/dependency security, sensitive runtime surfaces, npm
publication boundary, and remaining Docker image-size opportunities.

## Scope

- Root `package.json`, lockfile-backed dependency tree, npm advisories and signatures.
- Published package dry-run from `publish/`.
- Command runner, HTTP adapters, error serialization, static serving, proxying,
  configuration parsing, HMAC utility, and ORM query construction.
- Current distroless Docker image layers and pruned builder dependencies.

## Out of Scope

- Penetration testing against a deployed service.
- Authenticated container CVE scan.
- End-to-end database-sidecar testing.
- Fix implementation.

## Sources Reviewed

`package.json`, `package-lock.json`, `scripts/publish/prepare-publish.ts`,
`examples/Dockerfile`, `src/utils/command-runner/**`, `src/error/custom.ts`,
server providers, page adapters, route-handler error mapping, ORM adapters,
configuration loaders, HMAC helpers, relevant tests, Docker history, and npm
registry audit/signature output.

## Findings

### Direct Evidence

#### High - Command execution policy is fail-open by default

`runnerPolicySchema` leaves `allowlist` undefined, while `executeCommands`
accepts `{}` by default and describes those defaults as safe. Policy validation
only checks the command when a non-empty allowlist exists. A caller passing an
untrusted command specification with the default policy can therefore execute
any binary available to the process. `shell: false` prevents shell expansion
but does not prevent direct arbitrary process execution.

Evidence: `src/utils/command-runner/types.ts:31-43`,
`src/utils/command-runner/policy.ts:29-40`,
`src/utils/command-runner/execute-commands.ts:34-38`, and
`test/unit/utils/command-runner.test.ts:170-173`.

Recommendation: require a non-empty allowlist for the safe/default API. If an
unrestricted mode is needed, expose it through an explicitly named opt-in.

#### Medium - Working-directory containment is bypassable

The `cwdPrefix` check uses `spec.cwd.startsWith(policy.cwdPrefix)`. Direct
reproduction allowed both `/safe/prefix-evil` and `/safe/prefix/../escape` for
the prefix `/safe/prefix`.

Evidence: `src/utils/command-runner/policy.ts:70-79`. Reproduced with the live
TypeScript source on 2026-07-13.

Recommendation: canonicalize both paths with `path.resolve`, use
`path.relative` for lexical containment, and define whether symlinks must also
be contained using `realpath`.

#### Medium - Custom error JSON can disclose stacks and nested secrets

`CustomError.toJSON()` includes its own stack, metadata, reason, component,
operation, and nested error message/stack. Direct serialization of an
`InternalServerError` containing `Error('password=secret')` emitted that secret
and absolute source paths. Framework abstract route handlers map errors to
small response objects, but the shipped Fastify SQLite React example sends the
raw error from its global error handler.

Evidence: `src/error/custom.ts:91-145` and
`examples/fastify-sqlite-react/apps/backend/src/index.ts:82-100`.

Recommendation: make public serialization safe by default and provide a
separate diagnostic/log representation. Never send raw error instances from
example or production error handlers.

#### Low - HMAC helper exposes legacy algorithms without warning

The public HMAC type explicitly permits SHA-1 and MD5. HMAC use is not
equivalent to using those hashes directly, but these algorithms are poor
defaults for new systems and can violate security/compliance policy.

Evidence: `src/utils/hmac.ts:3-10` and corresponding SHA-1/MD5 tests.

Recommendation: limit the default API to SHA-256/SHA-512, or move legacy
algorithms behind an explicit compatibility API with deprecation guidance.

### Inferences

- The best Docker reduction path is dependency specialization, not changing
  the runtime base. Every example copies the same 118 MB expanded root
  `node_modules` layer containing all optional database drivers.
- A database build argument could omit all optional drivers and install only
  the selected example's driver. Direct package footprints in the pruned
  builder were approximately 12.3 MB for `better-sqlite3`, 7.4 MB for
  Mongoose, 5.6 MB for `sqlite3`, 3.7 MB for Sequelize, and 0.2 MB for `pg`;
  transitive savings require a prototype measurement.
- Framework-specific image variants may also avoid carrying both Express and
  Fastify stacks, but that is a larger packaging change and should follow the
  database-driver slice.
- Root and example dependency trees should be checked with `npm dedupe` or a
  workspace-style production install after driver specialization; current
  layers are 118 MB root plus 8.9-25 MB example dependencies.

### Assumptions

- Command specifications may be influenced by CLI, automation, or AI-tool
  input, as stated in the command-runner policy documentation.
- Expanded sizes refer to Docker Desktop's local accounting; compressed sizes
  refer to exported gzip archives as documented in `examples/DOCKER.md`.

### Unknowns

- Docker Scout authentication was completed after the initial audit. A follow-up
  scan of all eight specialized images detected zero vulnerabilities.
- Exact image savings from optional-driver specialization remain unmeasured.
- Runtime consumers may already wrap `CustomError`; the audit confirms the
  unsafe serialization capability and one shipped raw-send example, not every
  downstream application's behavior.

## Non-findings

- `npm audit` reported 0 known vulnerabilities across 777 total dependencies.
- `npm audit signatures` verified signatures for 703 packages and attestations
  for 137 packages.
- Targeted secret scanning found no committed private keys, GitHub tokens, or
  AWS access-key patterns. The only password match was documentation text.
- The publish artifact is constrained: 88,659 bytes packed, 576,736 bytes
  unpacked, 536 files, with no tests, examples, coverage, or secret-like files.
- ORM code uses parameterized ORM APIs within the inspected scope; no raw SQL
  concatenation was found.
- Static serving delegates to Express/Fastify static-file mechanisms; no direct
  user-controlled filesystem join was found within the inspected scope.
- Proxy upstreams come from service configuration, not request parameters,
  within the inspected scope.

## Risks

- Highest practical risk: consumers treating the command-runner defaults as a
  safe boundary for untrusted command specifications.
- Defense-in-depth risk: raw error serialization can expose filesystem paths,
  internal metadata, and nested secret-bearing messages.
- Docker Scout 1.20.4 uses a shared local indexing cache; concurrent scans can
  fail with cache-lock timeouts and should be run serially.

## Recommendations

1. Fix the command-runner default allowlist and canonical path containment as
   one security work item, with regression tests for sibling and traversal paths.
2. Split public error responses from diagnostic serialization and update the
   raw-send example.
3. Prototype database-driver-specialized Docker installs on one SQLite and one
   PostgreSQL image; compare expanded, compressed, build, and smoke-test results.
4. Add an authenticated container scan to CI and pin the distroless runtime by
   digest with a documented refresh process.
5. Consider deprecating HMAC-MD5 and HMAC-SHA1 in a versioned API change.

## Next Step

Implement the command-runner hardening first. It has the highest security value
and a small, testable scope. Run the Docker dependency-specialization prototype
as a separate optimization lane so security and packaging changes remain easy
to review.
