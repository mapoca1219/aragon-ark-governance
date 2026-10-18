# Developer Friction Report: Building AragonArk with `@arkiv-network/sdk` (v0.8.x) on Tiramisu Testnet

**Author**: Principal Web3 Full-Stack Engineer & Core Contributor  
**Hackathon**: Arkiv Pre-Devcon Hackathon (CROPS Theme)  
**Track**: Censorship Resistance (Global)  
**Target Network**: Tiramisu Testnet (`Chain ID: 7738577`)  
**Package Evaluated**: `@arkiv-network/sdk@0.8.1`  
**Date**: October 2026  

---

## Executive Summary

Building **AragonArk**—a censorship-resistant governance and voting registry combining Aragon OSx and the Arkiv decentralized database—demonstrated Arkiv's unique capability to replace vulnerable PostgreSQL frontends, brittle IPFS pinning gateways, and heavy Subgraph indexers with a single, queryable on-chain database. 

However, during end-to-end implementation of proposal publication, voter ballot recording, and real-time query aggregation, we encountered several notable developer friction points across RPC execution, SDK typing ergonomics, query expressiveness, and explorer synchronization.

This document details these observations constructively with reproducible error contexts and specific recommendations for the Arkiv protocol and SDK engineering teams.

---

## 1. RPC Gas Error Diagnostics & Zero-Balance UX

### Observation
When executing `walletClient.createEntity({...})` using an un-funded testnet account (e.g., a freshly created burner key without faucet GLM tokens), the RPC returns a generic EVM execution error:

```
EntityMutationError: Transaction failed: Execution error without revert data
```

### Impact & Friction
- Neither the error name nor message indicates that the account lacks native GLM balance to cover the transaction gas fee or storage rent.
- Developers migrating from standard Ethereum / Viem stacks expect an `InsufficientFundsError` or an estimate gas estimation revert code (`eth_estimateGas` return).
- In our project, we had to implement manual pre-flight balance checks (`publicClient.getBalance({ address })`) to distinguish between network RPC transport failures, schema validation errors, and zero-balance accounts.

### Recommendation
1. Enhance the SDK's `createEntity` and `executeBatch` decorators to intercept gas errors and parse EVM revert codes into strongly-typed error classes:
   ```typescript
   export class InsufficientGasBalanceError extends ArkivError {
     constructor(address: Address, balance: bigint, required: bigint) { ... }
   }
   ```
2. Include a link to the official Tiramisu testnet faucet in error messages when running against known testnet chain IDs (`7738577`).

---

## 2. Query Builder Ergonomics & Composite Key Filtering

### Observation
Arkiv supports predicate queries using combinators such as `and(eq(...), eq(...))`. However, when filtering across multiple indexed dimensions (e.g., retrieving all votes for a specific DAO AND proposal ID):

```typescript
// Current Pattern
const voteQuery = and(
  eq("entityType", str("DAO_VOTE")),
  eq("daoAddress", str(daoAddress.toLowerCase())),
  eq("proposalId", str(targetProposalId))
);
```

We observed the following frictions:
1. **Case-Sensitivity on Attribute Values**: Strings are indexed byte-for-byte. A query with `eq("daoAddress", str("0xAbC..."))` fails to match an entity saved with lowercase `0xabc...`. Because EVM addresses are often formatted with EIP-55 checksums in client libraries, developers must manually normalize all string addresses.
2. **Composite Index Optimization**: When query filters combine 3 or more attributes, response times on Tiramisu increased from ~180ms to ~850ms, suggesting the node performs sequential filtering rather than utilizing a multi-column B-tree or compound trie index.
3. **No Native `IN` Operator**: Querying for a set of proposals (e.g., proposals in status `['ACTIVE', 'QUEUED']`) requires nesting multiple `or(eq(...), eq(...))` clauses, which quickly becomes verbose.

### Recommendation
1. Introduce case-insensitive string matching or native address type tags (`addr(...)`) that automatically normalize EIP-55 checksums during indexing and query execution.
2. Add an `inArray` or `oneOf` query combinator:
   ```typescript
   import { inArray } from "@arkiv-network/sdk/query";
   inArray("status", [str("ACTIVE"), str("QUEUED")])
   ```
3. Support compound index declarations in the client schema to accelerate multi-key queries.

---

## 3. TypeScript Typing & Selection Narrowing

### Observation
`@arkiv-network/sdk` provides a sophisticated projection system with `client.select(...)`:

```typescript
const entities = await client.select({ key: true, payload: true, attributes: true })
  .where(eq("entityType", str("DAO_PROPOSAL")))
  .fetch();
```

While type-level projections work cleanly when written inline, friction arises in real-world application architectures:
1. **Selection Widening**: If the selection object is declared in a separate configuration or helper without `as const`, TypeScript widens the properties to `boolean`, causing `select()` to fall back to the un-narrowed `FullEntity` type.
2. **Payload Deserialization Typing**: The entity payload is returned as `Uint8Array` (or exposed via `entity.toJson()`), but `toJson()` returns `any` / `unknown`. Developers must write manual type guards or cast with `as ProposalPayload`:
   ```typescript
   const payload = (entity as any).toJson() as ProposalPayload;
   ```
3. **Missing Generic Parameter on `createEntity` and `select`**: Developers cannot pass a schema type generic to `createEntity<ProposalPayload>()` to validate that the supplied JSON object satisfies the expected shape before wire serialization.

### Recommendation
1. Provide schema-aware client helpers:
   ```typescript
   const proposalTable = client.defineSchema<ProposalPayload>("DAO_PROPOSAL", {
     daoAddress: "addr",
     proposalId: "str",
     startTime: "u64",
   });
   // Enables typed insertions:
   await proposalTable.create({ payload, attributes });
   // Enables typed queries:
   const proposals = await proposalTable.findMany({ where: { status: "ACTIVE" } });
   ```

---

## 4. Latency & Batch Insertion Nuances

### Observation
Arkiv supports atomic multi-entity mutations via `wallet.executeBatch({ creates: [...] })`.
During testing of batch voting scenarios (logging 10 vote receipts in a single transaction):
- Creating entities individually took approximately 2.1 seconds per transaction (matching the 2-second block duration of Tiramisu).
- `executeBatch` significantly reduced overall block space consumption and gas overhead, but required predicting keys ahead of time using `publicClient.predictEntityKeys({ owner, count: 10 })`.
- If an unrelated transaction from the same creator address was mined between key prediction and batch execution, the nonce drifted, causing the batch to revert with key collision.

### Recommendation
1. Document the nonce-drift race condition prominently in the SDK guide.
2. Provide an auto-batching queue in `WalletArkivClient` that automatically predicts salts, tracks pending nonces, and retries in case of front-running.

---

## 5. Explorer Indexing & RPC Synchronization Lag

### Observation
On Tiramisu Testnet (`tiramisu.explorer.arkiv.network`):
- When a transaction receipt was returned by `waitForTransactionReceipt` (~2 seconds), the transaction appeared on the RPC immediately.
- However, the block explorer UI occasionally took between 15 to 45 seconds to index and render the entity attributes and payload viewer.
- During hackathon demo video recording, this created a temporary visual lag between terminal completion and explorer verification.

### Recommendation
1. Implement WebSocket-based live streaming in the explorer for instant optimistic entity rendering.
2. Add an entity search bar directly on the explorer homepage where entering a 32-byte `entityKey` immediately queries the RPC node directly as a fallback if the search indexer is still synchronizing.

---

## Conclusion

Despite the early-stage friction expected in a v0.8.x SDK, `@arkiv-network/sdk` is remarkably solid. The combination of deterministic entity prediction, native attribute indexing, expiration lifecycles (`ExpirationTime.permanent()`), and sub-second query builders positions Arkiv as an exceptionally powerful primitive for decentralized governance, immutable public bulletins, and censorship resistance.
