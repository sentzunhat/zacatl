# Active Work

One folder per open work item, named by its ID (8-hex short ID or full UUID
from `hawp uuid` / `hawp work new`):

```
active/
  {id}/
    plan.md        # required
    files.md       # optional file tracking
    research.md    # optional supporting notes
```

Legacy flat files (`active/{id}.md`) are still accepted, but new items use the
folder layout. Items with an older mnemonic ID keep it as **Legacy ID** in the
plan header.

On close, move the folder to `../closed/YYYY/MM/DD/{id}/plan.md`. To pause an
item, move it to `../parked/`.

Canonical policy: [backlog-alignment.md](../../kit/references/backlog-alignment.md).
