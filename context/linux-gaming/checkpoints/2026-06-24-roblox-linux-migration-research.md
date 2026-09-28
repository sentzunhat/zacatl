# 2026-06-24 — Roblox-on-Linux migration research deferred to hands-on test

**Event/conversation date:** 2026-06-24 (local time)  
**Archive date:** 2026-09-29  
**Archive type:** Fallback research checkpoint; this is not a Zacatl project checkpoint.

## Before
A Windows gaming environment was in use. The objective under consideration was replacing Windows with a Linux/SteamOS/Bazzite-style gaming OS, with Roblox compatibility as a gating requirement.

## During
Roblox-on-Linux options were discussed and researched at a high level.

- Native Linux support was not assumed.
- Windows-client execution through Wine/Proton was identified as unofficial and potentially fragile because Roblox compatibility/anti-cheat behavior can change.
- Sober was identified as an alternative Linux route using the Android/mobile Roblox client.
- The mobile/store client was considered potentially sufficient for the intended gameplay.
- No Linux installation, boot test, Proton experiment, Sober installation, performance test, or account/game compatibility test was performed.

## After
The work remains research-only. No operating-system migration decision was finalized, and no claim of successful Roblox operation on the target hardware was established.

The next useful evidence is a hands-on compatibility test rather than more speculative configuration work.

## Strategic impact
Roblox is a gating application for the contemplated Windows-to-Linux gaming migration. The migration should therefore be validated against real gameplay before Windows is removed. Proton/Wine and Sober should be treated as separate compatibility paths rather than interchangeable implementations.

## Continuation state
- **Current state:** Research complete enough to justify a future practical test; testing intentionally deferred.
- **Latest milestone:** Candidate Linux Roblox paths identified.
- **Next milestone:** Demonstrate acceptable Roblox playability on the intended Linux/SteamOS/Bazzite-style environment.
- **Next actions:** Boot/install the candidate Linux environment when convenient; test the preferred Roblox route; verify login, game launch, input/controller behavior, graphics/performance, audio, and representative games.
- **Blocker:** No test environment has been booted or installed yet.
- **Dependencies:** Target hardware, Linux gaming distribution, current Roblox client behavior, and the selected compatibility route.
- **Unresolved questions:** Which route is currently most reliable on the target machine; whether all regularly played experiences work; whether updates introduce unacceptable maintenance.
- **Decision not to revisit without new evidence:** Do not treat research claims alone as proof that the Windows installation can be replaced.

## Resume point
Begin with a hands-on Roblox compatibility test on the candidate Linux/SteamOS/Bazzite-style environment.