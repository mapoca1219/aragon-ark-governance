# AragonArk: Censorship-Resistant Governance Engine & Public DAO Bulletin

**Track**: Censorship Resistance (Global) — Arkiv Pre-Devcon Hackathon (CROPS Theme)  
**Target Network**: Arkiv Tiramisu Testnet (`Chain ID: 7738577`, `RPC: https://rpc.tiramisu.db-chain.testnet.arkiv.network`, `Explorer: tiramisu.explorer.arkiv.network`)  
**Core Technologies**: Aragon OSx + Arkiv Decentralized Database (`@arkiv-network/sdk` v0.8.1) + Ethers v6  
**License**: MIT  

---

## 1. System Architecture Overview

Traditional DAO frontends and off-chain governance systems (Snapshot, IPFS pinning services, centralized Web2 PostgreSQL backends) create single points of failure. When an activist DAO, humanitarian treasury, or whistleblower fund is targeted:
1. **Frontends are blocked** via DNS takedowns, Cloudflare blocks, or hosting suspensions.
2. **IPFS gateways rate-limit or drop unpinned metadata**, breaking proposal bodies and dissent rationales.
3. **Indexer nodes (The Graph) desynchronize or censor query routes**, leaving voters in the dark.

**AragonArk** replaces this brittle architecture by embedding **Arkiv** as the native, unseizable on-chain database for Aragon OSx governance. Both proposals and cryptographic vote receipts are written directly into Arkiv with permanent retention, tamper-evident cryptographic digests, and decentralized indexing.

### ASCII System Architecture Diagram

```
+---------------------------------------------------------------------------------------------------+
|                                         ARAGONARK ARCHITECTURE                                    |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|    +-----------------------------+                  +----------------------------------------+    |
|    | Aragon OSx Governance Core  |                  |     Decentralized Voter & Member       |    |
|    | - DAO Address & Permissions |                  | - EIP-191 / EIP-712 Private Key Signer |    |
|    | - Executable Calldata Array |                  | - Token-Weighted Ballot Casting        |    |
|    +--------------+--------------+                  +-------------------+--------------------+    |
|                   |                                                     |                         |
|                   | Encodes Proposal                                    | Signs Vote Receipt      |
|                   v                                                     v                         |
|    +-----------------------------------------------------------------------------------------+    |
|    |                               @arkiv-network/sdk Client Bridge                          |    |
|    |   • Payload Compression & Canonical Keccak256 Digest Calculation                        |    |
|    |   • Retention Specification: ExpirationTime.permanent()                                 |    |
|    |   • Attribute Indexing: entityType, daoAddress, proposalId, voter, voteOption, time     |    |
|    +--------------------------------------------+--------------------------------------------+    |
|                                                 |                                                 |
|                                                 v JSON-RPC / P2P Gossip                           |
|    +-----------------------------------------------------------------------------------------+    |
|    |                     Arkiv Tiramisu Testnet (Chain ID: 7738577)                          |    |
|    |                                                                                         |    |
|    |  +-------------------------------------+   +------------------------------------------+ |    |
|    |  | ProposalEntity (DAO_PROPOSAL)       |   | VoteReceiptEntity (DAO_VOTE)             | |    |
|    |  | - Permanent On-Chain Payload        |   | - Signed EIP-191 Voter Receipt           | |    |
|    |  | - Indexed for Sub-Second Filtering  |   | - Full Dissent & Rationale Audit Trail   | |    |
|    |  +-------------------------------------+   +------------------------------------------+ |    |
|    +--------------------------------------------+--------------------------------------------+    |
|                                                 |                                                 |
|                                                 v Direct Decentralized Query Engine               |
|    +-----------------------------------------------------------------------------------------+    |
|    |                      Client-Side Verification & Tally Aggregator                        |    |
|    |  • Queries Arkiv DB directly via: client.query(and(eq("entityType", ...)))              |    |
|    |  • Verifies Tamper Resistance: Stored Hash == Recalculated Keccak256 (100% Match)        |    |
|    |  • Decodes & Tallies Votes On-The-Fly: NO Subgraph or Centralized Server Required!      |    |
|    +-----------------------------------------------------------------------------------------+    |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Mandatory Rubric Answers

### Rubric Question 1: Why This Pillar? (Censorship Resistance - Harm Analysis)

> **Who is harmed when governance data is silenced, censored, or altered?**

In centralized and pseudo-decentralized governance architectures, when hostile state entities, authoritarian regimes, or rogue corporate actors target a DAO:
1. **Activist & Humanitarian Treasuries**: Whistleblower protection DAOs, defense fund syndicates, and press-freedom DAOs can be paralyzed if their proposal descriptions or multisig execution payloads are deleted from centralized databases or blocked at the DNS/gateway layer. If proposal manifests disappear, signers cannot verify the intent of transactions, stalling emergency legal funding.
2. **Dissenting Minority Voters**: Centralized governance frontends have repeatedly altered or hidden dissenting comments, rationales, and negative votes during high-stakes fork or treasury disputes. Silencing dissent destroys community consensus legitimacy.
3. **Legal & Fiduciary Liability**: Without an immutable, verifiable audit trail of who voted, what proposal text was active at the time of vote casting, and whether quorum was genuinely reached, DAO participants face legal vulnerability.

AragonArk solves this harm by treating every proposal and ballot as an indelible, cryptographically authenticated historical fact recorded on Arkiv.

---

### Rubric Question 2: Why Arkiv? (Technical Breakdown vs Alternatives)

| Architecture Dimension | Centralized SQL (PostgreSQL) | Decentralized Storage (IPFS) | Decentralized Indexers (The Graph / Subgraphs) | **AragonArk on Arkiv** |
| :--- | :--- | :--- | :--- | :--- |
| **Tamper Resistance** | ❌ **Vulnerable**: Single database administrator can modify or drop rows; subject to subpoena. | ⚠️ **Partial**: Content-addressed, but pinning nodes can unpin or refuse to serve files. | ⚠️ **Partial**: Indexers can omit entities or fall out of consensus. | ✅ **Absolute**: Consensus-enforced state trie with cryptographic entity keys and proof hashes. |
| **Queryability** | ✅ Relational SQL queries. | ❌ **No Queries**: Flat files; requires an external indexing layer to find files by tag or author. | ✅ GraphQL queries, but requires custom assembly of schema mappings. | ✅ **Native Query Builder**: Sub-second queries by `daoAddress`, `proposalId`, `voter`, and `status`. |
| **Infrastructure Overhead** | ❌ Requires hosting and maintaining server clusters, backups, and firewall security. | ❌ Requires paid pinning services (Pinata, Infura) or self-hosted IPFS nodes. | ❌ Heavy node requirements (Graph Node, indexer fees, archive EVM node sync). | ✅ **Zero Indexer Nodes**: Query directly against standard Arkiv RPC nodes via `@arkiv-network/sdk`. |
| **Data Retention** | ⚠️ Subject to billing failure, server deprecation, or operator shutdown. | ❌ **Garbage Collection**: Unpinned files are dropped by IPFS nodes without warning. | ⚠️ Dependent on continuous subgraph indexing credits and node health. | ✅ **Protocol Lifecycle**: Native `ExpirationTime.permanent()` guarantees perpetual persistence. |
| **Client-Side Verification** | ❌ Client must trust the database server response blindly. | ⚠️ Client verifies CID hash, but cannot verify relational queries or missing items. | ⚠️ Requires trust in indexer dispute arbitration. | ✅ **100% Verifiable**: Client recalculates canonical keccak256 digests on raw entity payloads. |

---

### Rubric Question 3: How You Use Arkiv (Concrete Primitives & SDK Operations)

AragonArk leverages the following native primitives of `@arkiv-network/sdk` (v0.8.x):

1. **Client Initialization with Tiramisu Testnet**:
   ```typescript
   import { createPublicClient, createWalletClient } from "@arkiv-network/sdk";
   import { tiramisu } from "@arkiv-network/sdk/chains";
   import { http } from "viem";

   const publicClient = createPublicClient({ chain: tiramisu, transport: http(RPC_URL) });
   const walletClient = createWalletClient({ chain: tiramisu, transport: http(RPC_URL), account });
   ```

2. **Entity Creation with Permanent Retention (`createEntity`)**:
   ```typescript
   import { jsonToPayload, ExpirationTime } from "@arkiv-network/sdk";
   import { str, u64 } from "@arkiv-network/sdk/attr";

   const { entityKey, txHash, expiresAt } = await walletClient.createEntity({
     payload: jsonToPayload(proposalPayload),
     contentType: "application/json",
     expires: ExpirationTime.permanent(), // Guarantees perpetual, un-prunable retention
     attributes: {
       entityType: str("DAO_PROPOSAL"),
       daoAddress: str(proposalPayload.daoAddress.toLowerCase()),
       proposalId: str(proposalPayload.proposalId),
       status: str(proposalPayload.status),
       startTime: u64(BigInt(proposalPayload.votingStartTime)),
       endTime: u64(BigInt(proposalPayload.votingEndTime)),
       proposalHash: str(proposalPayload.proposalHash),
     },
   });
   ```

3. **Deterministic Entity Key Prediction (`predictEntityKeys`)**:
   ```typescript
   // Predicts keys ahead of time to allow batch linkages without on-chain collisions
   const [predictedKey] = await publicClient.predictEntityKeys({
     owner: account.address,
     count: 1,
   });
   ```

4. **Multi-Condition Query Engine (`client.query` & `client.select`)**:
   ```typescript
   import { and, eq } from "@arkiv-network/sdk/query";
   import { str } from "@arkiv-network/sdk/attr";

   // Fetch all vote receipts for a specific proposal directly from the database
   const voteQuery = and(
     eq("entityType", str("DAO_VOTE")),
     eq("proposalId", str("AIP-962"))
   );
   const results = await publicClient.query(voteQuery, { limit: 100 });
   ```

5. **Client-Side Cryptographic Reconciliation**:
   - Computes canonical hash over proposal fields to guarantee content integrity.
   - Recovers voter addresses via `ethers.verifyMessage` over `voteReceiptHash` to ensure zero fraudulent or spoofed ballots.

---

### Rubric Question 4: Friction Summary

Key insights from our technical friction report (`/arkiv/friction.md`):
- **RPC Gas Diagnostics**: Unfunded burner wallets trigger a generic `EntityMutationError` ("Execution error without revert data") rather than a descriptive `InsufficientFunds` message.
- **Address Formatting in Indices**: Attribute indexing is strict byte-matching, meaning checksummed `0xAbC...` and lowercase `0xabc...` require client-side normalization.
- **Explorer Sync Lag**: Arkiv explorer occasionally takes 15–45 seconds to reflect newly indexed entity attributes, even when the block transaction is mined in 2 seconds.

---

## 3. Quickstart Guide (Run in Under 60 Seconds)

### Step 1: Clone & Install Dependencies
```bash
git clone <repo-url>
cd aragon-ark
npm install
```

### Step 2: Configure Environment
Copy the pre-configured `.env.example`:
```bash
cp .env.example .env
```
*(The repository is configured by default to connect to the live Arkiv Tiramisu Testnet at `https://rpc.tiramisu.db-chain.testnet.arkiv.network` with synthetic testnet burner credentials.)*

### Step 3: Run Unit Tests (Logic & Cryptography First)
```bash
npm run test
```
*Expected: 9/9 tests pass (proposal hashing, signature validation, vote tallying, attribute grammar).*

### Step 4: Publish an Aragon DAO Proposal to Arkiv
```bash
npm run create:proposal
# Or: npx tsx src/createDaoProposal.ts
```

### Step 5: Cast a Censorship-Proof Signed Vote
```bash
npm run cast:vote -- AIP-962 YES "Defending whistleblowers is non-negotiable"
# Or: npx tsx src/castCensorshipProofVote.ts AIP-962 YES "Defending whistleblowers is non-negotiable"
```

### Step 6: Query Governance History & Compute Tally
```bash
npm run query:governance -- AIP-962
# Or: npx tsx src/queryGovernance.ts AIP-962
```

### Step 7: Launch Interactive Web Application
```bash
npm run dev
```
Open `http://localhost:3000` to interact with the full GUI dashboard, live Tiramisu network monitor, and browser terminal emulator.

---

## 4. 60-Second Demo Loom Video Script

*Use this script for your submission recording:*

- **00:00 - 00:10 (Hook & Problem)**:  
  *"Hi everyone, this is AragonArk for the Arkiv Pre-Devcon Hackathon (Censorship Resistance Track). Today, when DAOs are pressured by state actors or censorship, frontends are blocked, IPFS gateways drop proposal text, and subgraphs desync. Here is how we solved it with Arkiv."*
- **00:10 - 00:25 (Publishing a Proposal)**:  
  *[Show Terminal]* *"I run `npm run create:proposal`. Our script uses `@arkiv-network/sdk` to construct an Aragon OSx proposal with permanent retention (`ExpirationTime.permanent()`). We compute its canonical keccak256 hash and index it by `daoAddress` and `proposalId`. Notice the deterministic key predicted on Tiramisu testnet."*
- **00:25 - 00:40 (Casting Censorship-Proof Votes)**:  
  *[Show Terminal]* *"Next, a voter signs a vote with their private key using EIP-191. Running `npm run cast:vote` creates a `VoteReceiptEntity` directly on Arkiv, indexed with vote option, weight, and timestamp. Even if the website is seized, this ballot is permanently recorded."*
- **00:40 - 00:55 (Direct Query & Tally Verification)**:  
  *[Show Terminal / Explorer]* *"Now, running `npm run query:governance AIP-962` queries Arkiv directly. There are NO subgraphs and NO central databases. The client fetches the entities, verifies every signature and proposal hash for 100% untampered integrity, and tallies the vote."*
- **00:55 - 01:00 (Conclusion)**:  
  *[Show Tiramisu Explorer / UI]* *"Here is the transaction confirmed on `tiramisu.explorer.arkiv.network`. AragonArk makes DAO governance un-censorable, permanent, and sovereign. Thank you!"*
