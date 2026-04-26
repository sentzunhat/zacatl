# Verify examples and Docker builds under Node 26 and TypeScript 6

input: |
  The user wants a separate work item to make sure every example builds and runs on Node 26 with TypeScript 6, and that the Docker images build cleanly. If a reference implementation or workflow pattern is useful, the user is open to checking the Mawiltia repository for guidance.

context: |
  The root package now verifies cleanly under Node 26.3.0 and TypeScript 6.0.3. The remaining risk is the example matrix: multiple example apps, backend/frontend splits, and several Dockerfiles with different build scripts and runtime assumptions.

mission: |
  Audit and verify the examples and container build paths against Node 26 and TypeScript 6, then identify and fix any version, script, import, or Dockerfile issues that prevent the examples from building or running reliably.

constraints: |
  Keep the work focused on example execution and container build parity. Do not widen the scope to unrelated product features. Use reference material from Mawiltia only if it materially helps confirm a build pattern or Docker convention.

output: |
  A plan-ready work item that can be implemented as a matrix of example build/run checks and Docker build verification, with any required package or script fixes called out explicitly.
