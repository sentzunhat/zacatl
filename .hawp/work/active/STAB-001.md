# Align CI Node version with package engine baseline

input: |
  The audit found that `.github/workflows/cve-scan.yml` uses Node 24.14.0 while `package.json` requires Node >=26.3.0 and other workflows already use 26.3.0.

context: |
  This is a small release-gate consistency fix. The goal is to keep CI, local expectations, and package metadata aligned so production checks run on the supported runtime.

mission: |
  Update the remaining CI workflow(s) to use the repository's declared Node baseline and verify the release gates remain coherent.

constraints: |
  Keep the change narrowly scoped to workflow/runtime alignment unless a matching docs update is clearly required. Do not change package engines in order to match the outdated workflow.

output: |
  Updated workflow configuration and a brief verification note in the follow-up report or commit message.
