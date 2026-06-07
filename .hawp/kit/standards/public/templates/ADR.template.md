# Architecture Decision Record Template

Use this template to document important architectural decisions.

---

## Title

A short, descriptive name for the decision.

**Example:** "Replacing Fingerprint Pro with HMAC-based Device Tokening"

---

## Context

Describe the background and why this decision matters. Include business drivers, technical constraints, or costs.

**Example:** Fingerprint Pro is integrated in login flows to verify devices, but costs about $13K/year. The organization wants a lower-cost alternative without lowering security.

---

## Problem Statement

State the exact problem this ADR aims to solve, ideally in one or two sentences.

**Example:** Current device fingerprinting is expensive and the goal is to find a more cost-effective solution that maintains or improves user security and login experience.

---

## Current State

Explain how the system works today. Mention workflows, services, APIs, dependencies, and pain points.

**Example:** Member Portal → dEdge SDK → Datavisor API → Fingerprint Pro → User Service decides TRUSTED vs UNTRUSTED → triggers verification flows.

---

## Options Evaluated

List the alternatives considered, including "do nothing." For each option, provide pros and cons.

### Option 1: Replace with Secure Browser Cookie

**Pros:**

- Zero cost
- Built into all browsers
- Industry standard

**Cons:**

- Requires HTTPS and secure flags
- No protection against token theft via XSS
- Does not handle changing IP addresses well

### Option 2: New HMAC + Device Token Mechanism

**Pros:**

- Custom solution optimized for our use case
- Lower cost than Fingerprint Pro
- Full control over implementation
- Can be tuned to risk tolerance

**Cons:**

- More complex to implement
- Requires maintenance
- Custom solutions carry higher operational risk

### Option 3: Continue Using Fingerprint Pro (Status Quo)

**Pros:**

- Proven solution with high accuracy
- Minimal maintenance
- Industry-standard fingerprinting

**Cons:**

- $13K/year cost
- Vendor lock-in
- Slower improvement cycle

---

## Decision

**We are adopting Option 2: New HMAC + Device Token Mechanism.**

Device verification will use a hybrid approach:

1. Initial device registration stores HMAC signature of device attributes
2. Subsequent logins re-compute HMAC and compare against stored signature
3. Threshold allows ~15% drift before requiring re-verification
4. Browser fingerprinting is optional secondary signal (cost-free, from client)

---

## Rationale

- Cost reduction: $13K/year → <$500/year (maintenance + compute)
- Risk tolerance: Custom solution allows fine-tuning false positive/negative rates
- Flexibility: Can be quickly adapted as threat landscape changes
- Learning opportunity: Builds internal security expertise

---

## Implications

**What changes:**

- User Service needs new device verification service
- Member Portal needs device registration UI
- dEdge SDK needs device token extraction logic
- CI/CD needs verification tests

**What stays the same:**

- Login flow UX remains unchanged
- Challenge-response mechanism still used
- Datavisor integration continues

**Rollout:**

- Phase 1: Deploy device verification service (non-blocking)
- Phase 2: Roll out device token generation to 10% of users (monitor)
- Phase 3: Gradual rollout to 100% of users over 2 weeks
- Phase 4: Sunset Fingerprint Pro (disable vendor account)

---

## Alternatives Revisited

**If this decision fails:** Fall back to Option 1 (secure cookies) as temporary solution while re-evaluating.

---

## Related Decisions

- ADR-003: Session Token Strategy
- ADR-005: Challenge-Response Bootstrap

---

## Status

**Proposed** (awaiting review and approval)

**Reviewed by:** @security-team
**Approved by:** @product-lead
**Decision date:** 2026-05-11

---

## Appendix: Device Token Structure

```json
{
  "deviceId": "generated-uuid",
  "attributes": {
    "userAgent": "Mozilla/5.0...",
    "acceptLanguage": "en-US,en;q=0.9",
    "platform": "MacIntel",
    "timezone": "America/Los_Angeles"
  },
  "hmacSignature": "sha256(attributes + secret)",
  "createdAt": "2026-05-11T10:00:00Z",
  "lastSeen": "2026-05-11T14:30:00Z"
}
```
