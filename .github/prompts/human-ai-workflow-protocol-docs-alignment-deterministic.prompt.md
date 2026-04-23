---
name: docs-alignment-deterministic
description: Deterministic docs vs source alignment audit with machine-readable output
---

Role: Documentation Alignment Auditor.

Mission:

- treat `src/**` as the single source of truth
- compare implementation against `docs/**` and key root files
- produce deterministic, machine-readable output suitable for automation
- propose documentation changes only (no source refactors)

Scope:

- include: `src/**`, `docs/**`, `package.json`, `README.md`, `CHANGELOG.md` (if present), root config files (`tsconfig*`, `eslint*`, `vitest*`, etc.)
- exclude: `node_modules/**`, `dist/**`, build artifacts

Phase 1: Code Structure Discovery (from `src`)

Return:

```json
{
  "codeStructure": {
    "entryPoints": [],
    "modules": [],
    "publicAPIs": [],
    "databaseModels": [],
    "envVariables": [],
    "events": [],
    "cliCommands": [],
    "externalDependencies": [],
    "todos": []
  }
}
```

Phase 2: Documentation Claims (from `docs`)

Return:

```json
{
  "docsClaims": {
    "features": [],
    "apis": [],
    "architectureStatements": [],
    "roadmapClaims": [],
    "securityClaims": [],
    "runtimeAssumptions": []
  }
}
```

Phase 3: Drift Analysis

Compare `codeStructure` vs `docsClaims` and classify each finding as one of:

- `DOCUMENTED_BUT_NOT_IMPLEMENTED`
- `IMPLEMENTED_BUT_NOT_DOCUMENTED`
- `PARTIALLY_IMPLEMENTED`
- `OUTDATED_DOCUMENTATION`
- `INCORRECT_SECURITY_CLAIM`
- `VERSION_MISMATCH`
- `RUNTIME_MISMATCH`

Return:

```json
{
  "driftAnalysis": [
    {
      "type": "IMPLEMENTED_BUT_NOT_DOCUMENTED",
      "item": "",
      "evidenceFromCode": "",
      "evidenceFromDocs": "",
      "confidence": "HIGH"
    }
  ]
}
```

Evidence rules:

- reference exact file paths
- no vague statements
- if uncertain, use `"confidence": "LOW"`

Phase 4: Documentation Reconstruction Plan

Return:

```json
{
  "proposedDocsStructure": {
    "docs/architecture.md": "",
    "docs/api.md": "",
    "docs/domain.md": "",
    "docs/runtime.md": ""
  },
  "filesToDelete": [],
  "filesToUpdate": [],
  "filesToCreate": []
}
```

Phase 5: Machine-Readable Summary

Return:

```json
{
  "documentationHealthScore": 0,
  "riskLevel": "LOW",
  "criticalIssues": [],
  "recommendedNextSteps": [""]
}
```

Scoring:

- `90-100`: fully aligned
- `70-89`: minor drift
- `40-69`: moderate drift
- `0-39`: severe misalignment

Strict rules:

- do not hallucinate missing code
- do not rewrite code
- only propose documentation changes
- keep output deterministic
- avoid motivational language
