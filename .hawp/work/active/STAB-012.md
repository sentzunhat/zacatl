# Simplify fastify-sqlite-react using Mawiltia starter and barrel pruning

input: |
  The user wants the next stability step to focus on the barrel-import branch work and to make `examples/fastify-sqlite-react` easier and simpler by following the `sentzunhat/mawiltia` repository as a reference. The user also asked for the current image size.

context: |
  The SQLite Fastify example now builds and runs successfully, but the resulting image is still about 600MB and the packaging path is more complex than Mawiltia's lean starter Dockerfile. Mawiltia uses a simpler multi-stage layout, a smaller Alpine base, and a more direct runtime copy strategy.

mission: |
  Audit the fastify-sqlite-react example against Mawiltia's starter pattern and the barrel-import pruning branch, then simplify the example's Docker/package/runtime layout without regressing the working build and smoke test.

constraints: |
  Keep the scope on the fastify SQLite React example and the barrel-import simplification path. Do not re-open the broader repo stabilization audit unless the example work reveals a shared blocker. Preserve the verified Node 26 build/run behavior.

output: |
  A plan-ready implementation item that can reduce the example image size and runtime complexity, with a concrete checklist for Dockerfile, package script, and barrel-import cleanup work.
