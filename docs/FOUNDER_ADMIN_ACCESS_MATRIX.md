# Founder Admin Access Matrix

Status: discovery checkpoint only; no runtime behavior changed.
Branch: feature/founder-admin-design
Date: 2026-10-25

## Product access matrix (proposed for review)

This matrix is a proposal, not a statement that subscriptions are currently enforced or that these features are paid.

| Capability | Authentication / ownership requirement | Subscription policy decision needed | Founder exemption |
| --- | --- | --- | --- |
| Standard chat | Existing authenticated user | Confirm free tier and any quota/paid boundary | Only after central policy is approved |
| Streaming chat | Same authenticated user as standard chat | Must match standard chat policy and quota semantics | Same central policy; no separate bypass |
| Forecasting | Existing authenticated user | Decide whether included in free tier or subscription-gated | Only if designated paid by approved policy |
| Software Builder | Existing authenticated user | Decide tier and resource limits | Only if designated paid by approved policy |
| Voice transcription | Existing authenticated user | Decide product-plan limits; retain provider safety limits | Cannot bypass provider/infrastructure limits |
| Saved Memory | Existing authenticated user; enforce owner ID | Decide any product-plan quota; retain privacy/ownership | No cross-user memory access |
| Conversation history | Existing authenticated user; enforce owner ID | Decide any product-plan quota; retain privacy/ownership | No cross-user conversation access |
| Admin overview | Authenticated founder identity and verified/enabled database account | Not a customer feature entitlement | Admin authorization is separate from free access |

## Canonical storage decision

The current PaymentPersistence implementation defaults to a local JSON file at storage/payment.json. Its durability across production restarts, multiple instances, deployments, and rollback has not been established. Do not use it as the sole authority for permanent founder access until that is verified.

Before founder activation, choose one reviewed durable source of truth:
- extend the canonical payment/subscription persistence to a durable shared database with a migration and rollback plan; or
- create a separate, minimal product-access policy store in PostgreSQL, with a documented contract and no competing payment/subscription records.

The policy record must be server-owned and tied to the stable authenticated account ID. Never accept founder status, role, subscription state, plan, or user identity from request payloads.

## Required tests before enabling any policy

- Free-tier behavior for ordinary authenticated users remains unchanged.
- Explicitly paid features deny access when no valid entitlement exists.
- Normal and streaming chat apply the same access decision.
- Verified founder exemption works only for the configured founder identity.
- Unverified, disabled, or mismatched founder account is denied.
- Client-supplied `isFounder`, `isAdmin`, role, plan, and userId fields cannot grant access.
- Database outage fails safely without fabricating access or false zero usage.
- Existing authentication rate limits, provider safety limits, and ownership controls remain active.
- Policy survives process restart and is shared across application instances.
- No fake payment or synthetic customer subscription is created.

## Current status

This is documentation only. The founder subscription waiver, central product-access boundary, product plan matrix approval, durable policy storage, and UI dashboard are not implemented. PR #46 remains draft and must not be merged or deployed on the strength of this document alone.
