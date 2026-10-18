/**
 * AragonArk: Aragon OSx Governance & Arkiv Decentralized Database Type Definitions
 * Track: Censorship Resistance (Global) — CROPS Pre-Devcon Hackathon
 * SPDX-License-Identifier: MIT
 */

export interface DAOAction {
  to: string;
  value: string; // Wei in string representation
  data: string; // Calldata hex (e.g. 0x...)
}

export type ProposalStatus = 'ACTIVE' | 'EXECUTED' | 'DEFEATED' | 'CHALLENGED' | 'QUEUED';

export interface ProposalPayload {
  version: 'aragon-ark/v1.0';
  daoAddress: string;
  proposalId: string;
  title: string;
  description: string;
  metadataURI: string;
  creator: string;
  votingStartTime: number; // Unix seconds
  votingEndTime: number; // Unix seconds
  actionPayload: DAOAction[];
  status: ProposalStatus;
  proposalHash: string; // Canonical integrity digest
  supportThresholdBps: number; // e.g. 5000 = 50%
  minTurnoutBps: number; // e.g. 2000 = 20%
  executionBlockTarget?: number;
}

export type VoteOption = 'YES' | 'NO' | 'ABSTAIN';

export interface VoteReceiptPayload {
  version: 'aragon-ark/v1.0';
  daoAddress: string;
  proposalId: string;
  voter: string;
  voteOption: VoteOption;
  votingPower: string; // Token units (wei)
  rationale: string;
  timestamp: number; // Unix seconds
  signature: string; // EIP-191 or EIP-712 cryptographic signature
  voteReceiptHash: string;
  clientUserAgent?: string;
}

export interface GovernanceTally {
  proposalId: string;
  daoAddress: string;
  yesPower: bigint;
  noPower: bigint;
  abstainPower: bigint;
  totalVotesCount: number;
  participationPercentage: number;
  outcome: 'PASSING' | 'FAILING' | 'TIED';
  isThresholdReached: boolean;
  votes: VoteReceiptPayload[];
}

export interface StoredProposalEntity {
  entityKey: string;
  txHash: string;
  blockNumber: number;
  expiresAt: bigint | number;
  payload: ProposalPayload;
  attributes: {
    entityType: string;
    daoAddress: string;
    proposalId: string;
    status: string;
    startTime: bigint;
    endTime: bigint;
    proposalHash: string;
  };
}

export interface StoredVoteEntity {
  entityKey: string;
  txHash: string;
  blockNumber: number;
  expiresAt: bigint | number;
  payload: VoteReceiptPayload;
  attributes: {
    entityType: string;
    daoAddress: string;
    proposalId: string;
    voter: string;
    voteOption: string;
    timestamp: bigint;
    voteHash: string;
  };
}
