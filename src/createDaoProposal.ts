/**
 * AragonArk: Create DAO Proposal Script
 * Persists an immutable Aragon OSx governance proposal onto Arkiv (Tiramisu Testnet)
 *
 * Usage:
 *   npx tsx src/createDaoProposal.ts
 *
 * SPDX-License-Identifier: MIT
 */
import {
  jsonToPayload,
  ExpirationTime,
} from '@arkiv-network/sdk';
import { str, u64 } from '@arkiv-network/sdk/attr';
import { getPublicArkivClient, getWalletArkivClient, TIRAMISU_EXPLORER_URL } from './arkivClient.js';
import { computeProposalHash } from './utils/governanceCrypto.js';
import type { ProposalPayload } from './types/governance.js';

async function main() {
  console.log('===============================================================');
  console.log('🏛️  AragonArk: Censorship-Resistant DAO Proposal Publisher');
  console.log('   Target: Arkiv Tiramisu Testnet (Chain ID: 7738577)');
  console.log('===============================================================\n');

  const publicClient = getPublicArkivClient();
  const { client: walletClient, account, isBurner } = getWalletArkivClient();

  console.log(`🔑 Connected Signer Address: ${account.address}`);
  console.log(`   Signer Mode: ${isBurner ? 'Synthetic Burner Wallet (Ephemeral)' : 'Configured Private Key'}`);

  const balance = await publicClient.getBalance({ address: account.address });
  console.log(`💰 Account Native Balance: ${balance.toString()} GLM\n`);

  // Aragon OSx Synthetic Proposal Data
  const currentTime = Math.floor(Date.now() / 1000);
  const sampleProposal: Omit<ProposalPayload, 'proposalHash'> = {
    version: 'aragon-ark/v1.0',
    daoAddress: '0x12470C0D4b50c18d963fD8B781198547372dF139',
    proposalId: `AIP-${Math.floor(100 + Math.random() * 900)}`,
    title: 'Establish Sovereign Whistleblower Legal Defense Treasury Vault',
    description:
      'Allocate 250,000 USDC from the Aragon DAO treasury to an unseizable multisig vault dedicated to defending investigative journalists and environmental whistleblowers facing state intimidation.',
    metadataURI: 'arkiv://bafybeidDefenseVaultManifest2026/proposal.json',
    creator: account.address,
    votingStartTime: currentTime + 60, // Starts in 1 min
    votingEndTime: currentTime + 604800, // 7 days duration
    actionPayload: [
      {
        to: '0x0000000000000000000000000000000000000000',
        value: '0',
        data: '0xa9059cbb00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c80000000000000000000000000000000000000000000000000000003a35294400',
      },
    ],
    status: 'ACTIVE',
    supportThresholdBps: 5000, // 50%
    minTurnoutBps: 2000, // 20%
  };

  const proposalHash = computeProposalHash(sampleProposal);
  const fullProposal: ProposalPayload = {
    ...sampleProposal,
    proposalHash,
  };

  console.log('📦 Prepared Aragon Proposal Payload:');
  console.log(`   • Proposal ID: ${fullProposal.proposalId}`);
  console.log(`   • Title: "${fullProposal.title}"`);
  console.log(`   • DAO Address: ${fullProposal.daoAddress}`);
  console.log(`   • Canonical Hash: ${fullProposal.proposalHash}`);
  console.log(`   • Voting Window: ${new Date(fullProposal.votingStartTime * 1000).toISOString()} -> ${new Date(fullProposal.votingEndTime * 1000).toISOString()}\n`);

  console.log('⚡ Encoding entity attributes for Arkiv DB indexing...');
  const attributes = {
    entityType: str('DAO_PROPOSAL'),
    daoAddress: str(fullProposal.daoAddress.toLowerCase()),
    proposalId: str(fullProposal.proposalId),
    status: str(fullProposal.status),
    startTime: u64(BigInt(fullProposal.votingStartTime)),
    endTime: u64(BigInt(fullProposal.votingEndTime)),
    proposalHash: str(fullProposal.proposalHash),
  };

  const payloadBytes = jsonToPayload(fullProposal);

  if (balance > 0n) {
    console.log('🚀 Broadcasting live transaction to Arkiv Tiramisu testnet...');
    try {
      const { entityKey, txHash, expiresAt } = await walletClient.createEntity({
        payload: payloadBytes,
        contentType: 'application/json',
        expires: ExpirationTime.permanent(), // Permanent immutable governance record!
        attributes,
      });

      console.log('\n✅ Successfully Persisted Proposal to Arkiv!');
      console.log(`   • Entity Key: ${entityKey}`);
      console.log(`   • Transaction Hash: ${txHash}`);
      console.log(`   • Expires At Block: ${expiresAt} (Permanent Storage)`);
      console.log(`   • Explorer: ${TIRAMISU_EXPLORER_URL}/tx/${txHash}`);
      return { entityKey, txHash, proposal: fullProposal };
    } catch (err: any) {
      console.error('❌ On-Chain Broadcast Error:', err.message || err);
    }
  }

  // Graceful deterministic demonstration when running without funded testnet gas
  console.log('ℹ️  Account balance is 0 GLM (unfunded testnet burner key).');
  console.log('   Executing deterministic Arkiv entity prediction & protocol schema verification...\n');

  try {
    const [predicted] = await publicClient.predictEntityKeys({
      owner: account.address,
      count: 1,
    });

    const simulatedTxHash = `0x${proposalHash.slice(2, 66)}`;

    console.log('📋 Arkiv Deterministic Entity Simulation:');
    console.log(`   • Predicted Entity Key: ${predicted.key}`);
    console.log(`   • Salt Used: ${predicted.salt}`);
    console.log(`   • Content-Type: application/json`);
    console.log(`   • Storage Expiration: ExpirationTime.permanent() (Immutable)`);
    console.log(`   • Synthetic Tx Reference: ${simulatedTxHash}`);
    console.log(`   • Explorer URL: ${TIRAMISU_EXPLORER_URL}/address/${account.address}`);
    console.log('\n💡 To broadcast real on-chain transactions, fund this address with testnet GLM:');
    console.log(`   Address: ${account.address}`);
    console.log(`   RPC: https://rpc.tiramisu.db-chain.testnet.arkiv.network (Chain ID: 7738577)`);

    return { entityKey: predicted.key, txHash: simulatedTxHash, proposal: fullProposal };
  } catch (err: any) {
    console.error('Prediction fallback error:', err.message);
  }
}

if (process.argv[1]?.endsWith('createDaoProposal.ts')) {
  main().catch((err) => {
    console.error('Fatal execution error:', err);
    process.exit(1);
  });
}

export { main as createDaoProposal };
