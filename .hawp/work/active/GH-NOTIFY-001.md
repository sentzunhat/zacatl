# Reduce GitHub repo notification noise

**UUID:** `GH-NOTIFY-001`
**Type:** tooling
**Priority:** P3
**Reported:** 2026-07-27

---

## Goal

Make sentzunhat/zacatl quiet for anyone who stars or watches — patch releases should
not generate notification floods as the repo matures and more people watch it.

## What GitHub allows from the repo side

GitHub does not let repo owners suppress watcher notification preferences (each user
controls their own watch level: All Activity / Issues & PRs / Releases / Ignore). But
the repo can reduce the surface of notification-generating events:

| Feature         | Current state | Action              | Effect                          |
|-----------------|---------------|---------------------|---------------------------------|
| Discussions     | enabled       | Disable             | No discussion-created emails    |
| Issues          | enabled       | Keep (user reports) | No change                       |
| Wiki            | disabled      | —                   | Already off                     |
| Projects        | disabled      | —                   | Already off                     |
| Release emails  | automatic     | Not suppressable    | Users must set "Releases" watch |

## Immediate action (can be done without infrascode)

Disable Discussions via GitHub API:
```bash
gh api -X PATCH repos/sentzunhat/zacatl --field has_discussions=false
```

## infrascode integration (main task)

The infrascode project's `github-repo-hardener` should own this configuration so
it doesn't drift. Update its config for `sentzunhat/zacatl` to include:
- `has_discussions: false`
- Review whether `has_issues: true` is appropriate or if a separate tracker is
  preferred long-term

The hardener config path and key syntax depend on the infrascode project — check
`.hawp/work/` or the infrascode project's README for the correct format.

## Notes

- Only 1 subscriber currently (owner). This is forward-looking for when the repo
  grows a watcher base.
- Patch releases (0.0.x) will be frequent; setting watcher expectations early is
  better than retroactively asking people to adjust notification settings.
- Consider adding a note in CONTRIBUTING.md advising watchers to set
  "Releases only" watch level to avoid PR/push noise.
