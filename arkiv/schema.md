# AragonArk Schema Specification: Decentralized Governance on Arkiv

**Track**: Censorship Resistance (Global) — Arkiv Pre-Devcon Hackathon (CROPS Theme)  
**Target Network**: Arkiv Tiramisu Testnet (Chain ID: `7738577`)  
**SDK Version**: `@arkiv-network/sdk` ^0.8.1  
**License**: MIT  

---

## 1. Architectural Motivation & Paradigm Shift

Decentralized Autonomous Organizations (DAOs) rely on the premise that voting outcomes and treasury actions cannot be censored, rewritten, or expunged by coercive actors or state-level firewalls. However, in contemporary Web3:
- **Centralized SQL/Postgres frontends** (e.g. Snapshot UI backends) can be subpoenaed, Cloudflare-blocked, or altered.
- **Raw IPFS files** lack native queryability, do not guarantee persistence without centralized pinning services (e.g. Pinata), and cannot enforce relational integrity between proposals and incoming votes.
- **The Graph / Subgraphs** require running heavy decentralized indexer nodes with custom mappings, high synchronization latency (often 10–60 blocks behind head), and vulnerability to query fee exhaustion or indexer censorship.

**AragonArk** utilizes **Arkiv** as a primary on-chain decentralized database. On Arkiv, proposals and cryptographic vote receipts exist as first-class, immutable database entities with indexed query keys, native schema types, and cryptographic tamper verification.

---

## 2. Entity Schema Definitions

Arkiv stores structured data through a dual-layer representation:
1. **System Cell / Encoded Payload (`bytes`)**: The canonical, compressed JSON payload holding full descriptive narratives, Aragon OSx calldata execution payloads, and EIP-191 voter signatures.
2. **Indexed Attributes (`Record<string, ArkivValue>`)**: Typed protocol-level attributes indexed directly into Arkiv's decentralized state trie, enabling sub-second filtering and retrieval without external indexers.

```
+-----------------------------------------------------------------------------------------+
|                                    ARKIV ENTITY                                         |
|                                                                                         |
|  +-----------------------------------------------------------------------------------+  |
|  | Payload Cell (application/json)                                                   |  |
|  | - Canonical JSON payload with full text, EIP-191 signatures, action arrays        |  |
|  +-----------------------------------------------------------------------------------+  |
|                                                                                         |
|  +-----------------------------------------------------------------------------------+  |
|  | Indexed Attributes (Sorted ASCII keys, <=32 bytes each)                           |  |
|  | - entityType   : str("DAO_PROPOSAL" | "DAO_VOTE")                                 |  |
|  | - daoAddress   : str(0x...)                                                       |  |
|  | - proposalId   : str("AIP-962")                                                   |  |
|  | - status       : str("ACTIVE" | "EXECUTED" | "DEFEATED")                          |  |
|  | - startTime    : u64(1729290000)                                                  |  |
|  | - endTime      : u64(1729894800)                                                  |  |
|  | - proposalHash : str(0xb441cf...)                                                 |  |
|  +-----------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
```

---

### Entity 1: `ProposalEntity` (`DAO_PROPOSAL`)

Represents an immutable governance proposal submitted to an Aragon OSx DAO instance.

#### A. Indexed Attributes Table

| Attribute Name | Arkiv Type Tag | Wire Type | Max Size | Indexing Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `entityType` | `str` | ASCII String | 12 bytes | Partitions entities in the database (`DAO_PROPOSAL` vs `DAO_VOTE`). |
| `daoAddress` | `str` | Hex String | 42 bytes | Enables querying all proposals belonging to a specific Aragon DAO. |
| `proposalId` | `str` | UTF-8 String | 32 bytes | Unique proposal human/slug identifier (e.g. `AIP-962`). |
| `status` | `str` | ASCII String | 16 bytes | Allows instant client filtering by governance state (`ACTIVE`, `EXECUTED`). |
| `startTime` | `u64` | `uint64` | 8 bytes | Supports range queries for voting start bounds (`gte('startTime', u64(...))`). |
| `endTime` | `u64` | `uint64` | 8 bytes | Supports filtering for ongoing vs finalized proposals (`lte('endTime', u64(...))`). |
| `proposalHash` | `str` | Hex String | 66 bytes | Keccak-256 canonical digest for instant client-side tamper verification. |

#### B. Payload Structure (`application/json`)

```typescript
export interface ProposalPayload {
  version: 'aragon-ark/v1.0';
  daoAddress: string;           // EIP-55 Checksummed 0x address
  proposalId: string;           // Canonical identifier
  title: string;                // Plain-text proposal title
  description: string;          // Extended governance rationale & impact analysis
  metadataURI: string;          // Permanent arkiv:// or ipfs:// manifest URI
  creator: string;              // Submitter Ethereum address
  votingStartTime: number;      // Unix timestamp (seconds)
  votingEndTime: number;        // Unix timestamp (seconds)
  actionPayload: DAOAction[];   // Aragon OSx executable calldata actions
  status: ProposalStatus;       // 'ACTIVE' | 'EXECUTED' | 'DEFEATED' | 'QUEUED'
  proposalHash: string;         // Canonical keccak256 digest
  supportThresholdBps: number;  // Basis points (e.g. 5000 = 50%)
  minTurnoutBps: number;        // Basis points (e.g. 2000 = 20%)
}

export interface DAOAction {
  to: string;                   // Target contract to invoke
  value: string;                // Native wei value to forward
  data: string;                 // Hex calldata (ABI-encoded method call)
}
```

---

### Entity 2: `VoteReceiptEntity` (`DAO_VOTE`)

Represents a cryptographically signed voter ballot cast on a proposal.

#### A. Indexed Attributes Table

| Attribute Name | Arkiv Type Tag | Wire Type | Max Size | Indexing Rationale |
| :--- | :--- | :--- | :--- | :--- |
| `entityType` | `str` | ASCII String | 8 bytes | Discriminator set to `"DAO_VOTE"`. |
| `daoAddress` | `str` | Hex String | 42 bytes | Scopes vote queries to a specific DAO instance. |
| `proposalId` | `str` | UTF-8 String | 32 bytes | Correlates the vote receipt to its parent proposal. |
| `voter` | `str` | Hex String | 42 bytes | Tracks individual voter participation & prevents double-counting. |
| `voteOption` | `str` | ASCII String | 8 bytes | `YES`, `NO`, or `ABSTAIN` for instant tally aggregation. |
| `timestamp` | `u64` | `uint64` | 8 bytes | Timestamp of signature issuance for voting window compliance. |
| `voteHash` | `str` | Hex String | 66 bytes | Keccak-256 hash of the canonical vote content. |

#### B. Payload Structure (`application/json`)

```typescript
export interface VoteReceiptPayload {
  version: 'aragon-ark/v1.0';
  daoAddress: string;           // Aragon DAO address
  proposalId: string;           // Target Proposal identifier
  voter: string;                // Voter's Ethereum address
  voteOption: 'YES' | 'NO' | 'ABSTAIN';
  votingPower: string;          // Governance token balance in wei (18 decimals)
  rationale: string;            // Public statement explaining voting stance
  timestamp: number;            // Signature creation timestamp
  signature: string;            // EIP-191 signature over canonical voteReceiptHash
  voteReceiptHash: string;      // Keccak256 hash
  clientUserAgent?: string;     // Client metadata proving provenance
}
```

---

## 3. Data Integrity & Validation Constraints

1. **Deterministic Entity Key Prediction**:
   - Entities on Arkiv receive deterministic 32-byte keys derived from `(chain_id, registry, owner, nonce, salt)`.
   - Before submission, clients can invoke `publicClient.predictEntityKeys({ owner, count })` to link child vote entities to the parent proposal key in a single batch.

2. **Attribute Name Grammar Rules**:
   - Attribute names must be 1–32 ASCII bytes.
   - Must begin with a letter (`[A-Za-z]`) and may contain alphanumeric characters, `_`, `.`, or `-`.
   - Attributes must be sorted in strictly ascending byte order before on-chain hashing into the state root.

3. **Storage Retention**:
   - All AragonArk governance records are stored using `expires: ExpirationTime.permanent()`.
   - This guarantees that proposals and dissenting ballots cannot be auto-pruned or expired by state node operators.

4. **Cryptographic Tamper Auditing**:
   - Any client reading from Arkiv independently recalculates:
     $$\text{ProposalHash} = \text{keccak256}(\text{DAO} \parallel \text{ID} \parallel \text{Title} \parallel \text{URI} \parallel \text{Start} \parallel \text{End} \parallel \text{Actions})$$
   - If the recalculated hash does not match `entity.attributes.proposalHash`, the record is immediately flagged as tampered.
   - For votes, `ethers.verifyMessage(voteReceiptHash, signature)` verifies that the voter private key directly authorized the ballot.
