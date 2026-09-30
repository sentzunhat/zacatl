# MCP Intake to Work Document

Use this flow when the MCP client exposes `hawp_work_intake`.

## 1. Intake the request

Call `hawp_work_intake` with the user's original request, without rewriting it:

```json
{
  "input": "Audit the work-folder normalization boundary and continue the next safe slice",
  "limit": 10,
  "max_tokens": 2000
}
```

The response is authoritative for the next step. Do not infer readiness from
prose or from a successful tool transport alone.

## 2. Handle the structured state

- `ready_for_work_new`: inspect the returned `draft`, confirm the repository and
  existing backlog, then call `hawp_work_new` only if this is genuinely new work.
- `needs_user_input`: ask the returned `questions` or gather the missing context;
  do not create a confident-looking work item.
- `blocked_missing_index`: build or repair the local search index, then retry.
- `blocked_reshape_failed`: preserve the retrieved context, retry with a focused
  request or another available local model, and do not treat the failure as a
  draft.

User answers resolve missing context; they do not grant implementation approval.
Implementation approval and work-item creation remain separate decisions.

## 3. Create only genuinely new work

After a `ready_for_work_new` response and a backlog check, pass the original
request plus the shaped fields to `hawp_work_new`. If an existing UUID matches
the intent, continue that plan instead of creating a duplicate.

## 4. Document verified progress

After implementation or a meaningful checkpoint, call `hawp_work_doc` for the
appropriate evidence, status, decision, or note document. Record direct checks
separately from inference and remaining uncertainty, then run
`hawp_work_validate`.

The compact path is:

```text
hawp_work_intake
  -> ready_for_work_new or explicit questions/blocker
  -> optional user answer
  -> existing UUID or hawp_work_new
  -> implementation and verification
  -> hawp_work_doc
  -> hawp_work_validate
```
