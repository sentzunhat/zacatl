# Integrate export-aware barrel pruning and local exports sync

input: |
  The user wants the barrel-import branch reviewed and audited, then merged into the current update branch. The repo also needs the barrel prune script run and the script pipeline verified under Node 26.

context: |
  Current branch is `another-update-branch-work`. The remote branch `origin/copilot/remove-barrol-imports-again` contains the missing publish-time barrel prune utility and the local exports sync script that the current branch references but does not yet carry.

mission: |
  Integrate the export-aware barrel pruning and local exports sync flow into this branch, then verify that the relevant scripts work under Node 26.

constraints: |
  Keep the scope to barrel/export handling, publish packaging, and Node 26 verification. Do not discard unrelated working tree changes or rewrite unrelated repo content.

output: |
  A merged branch state with the missing publish utilities added, the publish pipeline invoking barrel pruning, and verification evidence for the relevant scripts.
