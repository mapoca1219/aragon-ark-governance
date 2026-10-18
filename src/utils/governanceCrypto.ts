/**
 * AragonArk Governance Cryptography, Hashing & Vote Tally Engine
 * SPDX-License-Identifier: MIT
 */
import { keccak256, toUtf8Bytes, getAddress, verifyMessage } from 'ethers';
import type { ProposalPayload, VoteReceiptPayload, GovernanceTally } from '../types/governance.js';

/**
 * Computes canonical keccak256 digest of Aragon proposal content.
 */
export function computeProposalHash(proposal: Omit<ProposalPayload, 'proposalHash' | 'version'>): string {
  const normalizedActions = (proposal.actionPayload || []).map((a) => `${a.to.toLowerCase()}:${a.value}:${a.data.toLowerCase()}`).join('|');
  const canonicalString = [
    getAddress(proposal.daoAddress.toLowerCase()),
    proposal.proposalId.trim(),
    proposal.title.trim(),
    proposal.metadataURI.trim(),
    proposal.votingStartTime.toString(),
    proposal.votingEndTime.toString(),
    normalizedActions,
  ].join(':::');

  return keccak256(toUtf8Bytes(canonicalString));
}

/**
 * Computes canonical keccak256 hash of a vote receipt.
 */
export function computeVoteHash(vote: Omit<VoteReceiptPayload, 'voteReceiptHash' | 'signature' | 'version'>): string {
  const canonicalString = [
    getAddress(vote.daoAddress.toLowerCase()),
    vote.proposalId.trim(),
    getAddress(vote.voter.toLowerCase()),
    vote.voteOption.trim(),
    vote.votingPower.trim(),
    vote.timestamp.toString(),
    vote.rationale.trim(),
  ].join(':::');

  return keccak256(toUtf8Bytes(canonicalString));
}

/**
 * Verifies that a vote's cryptographic signature was produced by the declared voter address.
 */
export function verifyVoteSignature(vote: VoteReceiptPayload): boolean {
  try {
    const rawContentHash = computeVoteHash(vote);
    const expectedSigner = getAddress(vote.voter.toLowerCase());
    const recoveredAddress = verifyMessage(rawContentHash, vote.signature);
    return getAddress(recoveredAddress.toLowerCase()) === expectedSigner;
  } catch {
    return false;
  }
}

/**
 * Computes governance tally directly from a collection of Arkiv vote receipts.
 */
export function computeGovernanceTally(
  proposalId: string,
  daoAddress: string,
  votes: VoteReceiptPayload[]
): GovernanceTally {
  let yesPower = 0n;
  let noPower = 0n;
  let abstainPower = 0n;

  for (const vote of votes) {
    const power = BigInt(vote.votingPower || '0');
    switch (vote.voteOption) {
      case 'YES':
        yesPower += power;
        break;
      case 'NO':
        noPower += power;
        break;
      case 'ABSTAIN':
        abstainPower += power;
        break;
    }
  }

  const totalDecisivePower = yesPower + noPower;
  let outcome: 'PASSING' | 'FAILING' | 'TIED' = 'TIED';

  if (yesPower > noPower) outcome = 'PASSING';
  else if (noPower > yesPower) outcome = 'FAILING';

  const participationPercentage = totalDecisivePower > 0n ? Number((yesPower * 10000n) / (totalDecisivePower + abstainPower)) / 100 : 0;

  return {
    proposalId,
    daoAddress: getAddress(daoAddress.toLowerCase()),
    yesPower,
    noPower,
    abstainPower,
    totalVotesCount: votes.length,
    participationPercentage,
    outcome,
    isThresholdReached: yesPower > noPower,
    votes,
  };
}

export function formatVotingPower(powerWei: string | bigint): string {
  const raw = BigInt(powerWei.toString());
  const whole = raw / 10n ** 18n;
  return `${whole.toLocaleString()} GOV`;
}
