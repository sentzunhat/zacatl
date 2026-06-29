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

verification: |
  2026-06-29T00:44Z PR #35 head 5d8502e0e91916d011d62b19c9f727e2cacd0582 completed Peer install check run 85 successfully and Publish (dry-run) run 58 successfully, but OWASP CVE-Lite Dependency Scan run 14 failed in the `Scan directories for vulnerabilities` step. The run uploaded `cve-lite-reports` artifact 7940317506 for direct evidence capture.

  Remediation applied on branch `stability/review-20260628-2340`: `.github/workflows/cve-scan.yml` now uses Node 26.3.0, matching the package engine baseline, and prints bounded matching report tails when CVE-Lite still fails so the next run exposes exact failing package-lock evidence in the job log as well as the artifact.

  2026-06-29T01:36Z PR #35 head 4844fcb4735e91df2955e31c931756763109829c reported `action_required` for OWASP CVE-Lite Dependency Scan run 18, Publish (dry-run) run 62, and Peer install check run 89. The latest CVE run returned no jobs and no artifacts, so there was no scanner log or package evidence to classify. The smallest safe remediation is to remove the temporary auto-remediation workflow added for lockfile refresh, then let the normal PR workflows run again on the branch.
