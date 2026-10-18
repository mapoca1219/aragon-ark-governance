import test from 'node:test';
import assert from 'node:assert/strict';
import { Wallet } from 'ethers';
import {
  computeProposalHash,
  computeVoteHash,
  verifyVoteSignature,
  computeGovernanceTally,
  formatVotingPower,
} from './governanceCrypto.ts';
import type { ProposalPayload, VoteReceiptPayload } from '../types/governance.ts';

test('computeProposalHash generates consistent keccak256 hash', () => {
  const proposal: Omit<ProposalPayload, 'proposalHash' | 'version'> = {
    daoAddress: '0x1111111111111111111111111111111111111111',
    proposalId: 'PROP-2026-001',
    title: 'Emergency Treasury Safeguard',
    description: 'Protect community pool against state sanctions seizure.',
    metadataURI: 'arkiv://entities/0xabc123',
    creator: '0x2222222222222222222222222222222222222222',
    votingStartTime: 1729290000,
    votingEndTime: 1729376400,
    actionPayload: [
      {
        to: '0x3333333333333333333333333333333333333333',
        value: '1000000000000000000',
        data: '0x',
      },
    ],
    status: 'ACTIVE',
    supportThresholdBps: 5000,
    minTurnoutBps: 2000,
  };

  const hash1 = computeProposalHash(proposal);
  const hash2 = computeProposalHash(proposal);

  assert.equal(hash1, hash2);
  assert.equal(hash1.startsWith('0x'), true);
  assert.equal(hash1.length, 66);
});

test('verifyVoteSignature validates authentic voter cryptographic signature', async () => {
  const wallet = Wallet.createRandom();

  const voteUnsigned: Omit<VoteReceiptPayload, 'voteReceiptHash' | 'signature' | 'version'> = {
    daoAddress: '0x1111111111111111111111111111111111111111',
    proposalId: 'PROP-2026-001',
    voter: wallet.address,
    voteOption: 'YES',
    votingPower: '2500000000000000000000',
    timestamp: 1729290500,
    rationale: 'Decentralized resilience is essential for whistleblower safety.',
  };

  const voteHash = computeVoteHash(voteUnsigned);
  const signature = await wallet.signMessage(voteHash);

  const fullVote: VoteReceiptPayload = {
    ...voteUnsigned,
    version: 'aragon-ark/v1.0',
    signature,
    voteReceiptHash: voteHash,
  };

  assert.equal(verifyVoteSignature(fullVote), true);

  // Tampered vote option
  const tamperedVote = { ...fullVote, voteOption: 'NO' as const };
  assert.equal(verifyVoteSignature(tamperedVote), false);
});

test('computeGovernanceTally computes correct quorum and outcome', () => {
  const votes: VoteReceiptPayload[] = [
    {
      version: 'aragon-ark/v1.0',
      daoAddress: '0x1111111111111111111111111111111111111111',
      proposalId: 'PROP-2026-001',
      voter: '0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      voteOption: 'YES',
      votingPower: '500000000000000000000', // 500
      timestamp: 1729290100,
      rationale: 'Aye',
      signature: '0x',
      voteReceiptHash: '0x',
    },
    {
      version: 'aragon-ark/v1.0',
      daoAddress: '0x1111111111111111111111111111111111111111',
      proposalId: 'PROP-2026-001',
      voter: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
      voteOption: 'NO',
      votingPower: '200000000000000000000', // 200
      timestamp: 1729290200,
      rationale: 'Nay',
      signature: '0x',
      voteReceiptHash: '0x',
    },
    {
      version: 'aragon-ark/v1.0',
      daoAddress: '0x1111111111111111111111111111111111111111',
      proposalId: 'PROP-2026-001',
      voter: '0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
      voteOption: 'ABSTAIN',
      votingPower: '100000000000000000000', // 100
      timestamp: 1729290300,
      rationale: 'Abstain',
      signature: '0x',
      voteReceiptHash: '0x',
    },
  ];

  const tally = computeGovernanceTally('PROP-2026-001', '0x1111111111111111111111111111111111111111', votes);

  assert.equal(tally.yesPower, 500000000000000000000n);
  assert.equal(tally.noPower, 200000000000000000000n);
  assert.equal(tally.abstainPower, 100000000000000000000n);
  assert.equal(tally.totalVotesCount, 3);
  assert.equal(tally.outcome, 'PASSING');
  assert.equal(tally.isThresholdReached, true);
});

test('formatVotingPower formats 18 decimal units cleanly', () => {
  const formatted = formatVotingPower('1500000000000000000000');
  assert.equal(formatted, '1,500 GOV');
});
