# REG-096 PostgreSQL Schema Review

Status: reviewed schema proposal; no SQL migration or runtime code added
Branch: feature/founder-admin-design
Date: 2026-10-25

## Verified domain object shapes

Source files inspected:
- `payment/PaymentTransaction.js`
- `payment/Subscription.js`
- `payment/Entitlement.js`
- `payment/ProviderReference.js`
- `payment/PaymentTypes.js`
- `payment/PaymentPersistence.js`
- `payment/PaymentRegistry.js`

The current domain objects have these canonical fields:

- Payment transaction: `id`, `version`, `userId`, `provider`, `idempotencyKey`, `lifecycle`, `createdAt`, `updatedAt`.
- Subscription: `id`, `version`, `userId`, `provider`, `lifecycle`, `createdAt`, `updatedAt`.
- Entitlement: `id`, `version`, `userId`, `subscriptionId`, `lifecycle`, `createdAt`, `updatedAt`.
- Provider reference: `id`, `version`, `userId`, `provider`, `providerObjectType`, `providerObjectId`, `canonicalObjectType`, `canonicalObjectId`, `createdAt`.

Valid provider values are `flutterwave` and `apple_iap`. Lifecycle values are defined in `payment/PaymentTypes.js` and must be enforced consistently with the domain layer.

## Schema design constraints

The following is a design target, not executable SQL:

1. `chattbm_payment_transactions`
   - Primary key: canonical `id`.
   - Required owner `user_id`, provider, idempotency key, lifecycle, positive version, creation/update timestamps.
   - Unique constraint on idempotency key only if contract and current behavior confirm it is globally unique; otherwise use the correct documented scope. Current persistence indexes idempotency keys globally, and the boundary rejects a key reused across a different user/provider.
   - Provider and lifecycle checks must match the domain enums.

2. `chattbm_subscriptions`
   - Primary key: canonical `id`; required owner, provider, lifecycle, positive version, timestamps.
   - Foreign key to users should use the repository's established user identifier type and approved retention/deletion semantics.

3. `chattbm_entitlements`
   - Primary key: canonical `id`; required owner, `subscription_id`, lifecycle, positive version, timestamps.
   - Foreign keys to subscription and user, with a consistency rule/test that the entitlement owner matches its subscription owner.
   - Preserve the REG-096 rule that an entitlement cannot become active without verified payment/subscription authority.

4. `chattbm_provider_references`
   - Primary key: canonical `id`; owner, provider, provider object type/id, canonical object type/id, version, creation timestamp.
   - Unique key on `(provider, provider_object_type, provider_object_id)`.
   - Referential integrity for canonical object association should be enforced through a reviewed design. Because the current object type/id pair is polymorphic, a naive single foreign key cannot protect all target tables; consider typed nullable foreign keys with a check constraint, or repository-level transactional validation. Do not weaken uniqueness or ownership while solving this.

5. Migration ledger
   - Migration ID, checksum, applied timestamp, and optional runner version.
   - A changed checksum for an already-applied migration must halt and require manual review.

## Important unresolved design gaps

- The current `PaymentTransaction` object contains no normalized amount/currency or provider response fields. Inspect provider boundary/adapter contracts before defining storage for any extra data; do not invent fields.
- Entitlement ownership must be consistent with its subscription ownership. The existing in-memory registry validates each object but database constraints for cross-row owner consistency need explicit design.
- Provider references use a polymorphic canonical object association, which cannot be safely enforced by one ordinary foreign key.
- The current JSON persistence writer replaces a file atomically but does not provide shared cross-process transactions or PostgreSQL durability.
- Current in-memory registries and JSON persistence are not a durable multi-instance source of truth.
- Existing data migration must validate relationships before import; invalid legacy records should be reported and quarantined, not silently rewritten.

## Next implementation sequence

1. Approve the schema and resolve the open ownership/idempotency/reference constraints.
2. Define the migration runner's exact CLI, transaction, advisory-lock, checksum, and rollback semantics.
3. Add the runner and schema migrations only after an isolated PostgreSQL test database is available.
4. Implement a PostgreSQL repository behind the existing PaymentPersistence interface, keeping API result/error behavior stable.
5. Add integration tests for uniqueness, lifecycle, ownership, idempotency, concurrency, restart, outage, import, and rollback.
6. Perform a dry-run import and reconciliation before any production cutover.
7. Keep founder exemption disabled and do not change live product access during the persistence migration.

No production schema or data was changed in this review.
