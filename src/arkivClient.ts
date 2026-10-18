/**
 * ArkivPress: Arkiv Tiramisu Testnet Client
 * Network: Tiramisu (Arkiv Database Chain)
 * Chain ID: 7738577
 * RPC: https://rpc.tiramisu.db-chain.testnet.arkiv.network
 * Explorer: https://tiramisu.explorer.arkiv.network
 *
 * SPDX-License-Identifier: MIT
 */
import {
  createPublicClient,
  createWalletClient,
  type PublicArkivClient,
  type WalletArkivClient,
} from '@arkiv-network/sdk';
import { tiramisu } from '@arkiv-network/sdk/chains';
import { http, type Hex } from 'viem';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';
import * as dotenv from 'dotenv';

// Guard dotenv for Node.js execution while remaining fully browser-safe
if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
  try {
    dotenv.config();
  } catch {
    // Ignore in browser
  }
}

export const TIRAMISU_RPC_URL =
  (typeof process !== 'undefined' && process.env?.ARKIV_RPC_URL) ||
  'https://rpc.tiramisu.db-chain.testnet.arkiv.network';
export const TIRAMISU_CHAIN_ID = 7738577;
export const TIRAMISU_EXPLORER_URL =
  (typeof process !== 'undefined' && process.env?.ARKIV_EXPLORER_URL) ||
  'https://tiramisu.explorer.arkiv.network';

/**
 * Returns a configured PublicArkivClient connected to Tiramisu testnet.
 */
export function getPublicArkivClient(): PublicArkivClient {
  return createPublicClient({
    chain: tiramisu,
    transport: http(TIRAMISU_RPC_URL, {
      timeout: 15_000,
      retryCount: 3,
      retryDelay: 1_000,
    }),
  });
}

/**
 * Returns a configured WalletArkivClient with either a provided private key,
 * the PRIVATE_KEY environment variable, or an ephemeral burner private key.
 */
export function getWalletArkivClient(customPrivateKey?: string): {
  client: WalletArkivClient;
  account: ReturnType<typeof privateKeyToAccount>;
  isBurner: boolean;
} {
  const envKey = typeof process !== 'undefined' ? process.env?.PRIVATE_KEY?.trim() : undefined;
  const rawKey = customPrivateKey?.trim() || envKey;

  let finalKey: Hex;
  let isBurner = false;

  if (rawKey && rawKey.startsWith('0x') && rawKey.length === 66) {
    finalKey = rawKey as Hex;
  } else {
    // Generate synthetic burner key for safety & reproduction
    finalKey = generatePrivateKey();
    isBurner = true;
  }

  const account = privateKeyToAccount(finalKey);

  const client = createWalletClient({
    chain: tiramisu,
    transport: http(TIRAMISU_RPC_URL, {
      timeout: 20_000,
      retryCount: 2,
    }),
    account,
  });

  return { client, account, isBurner };
}

/**
 * Diagnostic helper to verify RPC liveness and chain synchronization.
 */
export async function checkNetworkHealth() {
  const publicClient = getPublicArkivClient();
  const [blockNumber, timing, entityCount] = await Promise.all([
    publicClient.getBlockNumber(),
    publicClient.getBlockTiming(),
    publicClient.getEntityCount().catch(() => 0),
  ]);

  return {
    status: 'ONLINE',
    chainId: TIRAMISU_CHAIN_ID,
    rpcUrl: TIRAMISU_RPC_URL,
    explorerUrl: TIRAMISU_EXPLORER_URL,
    blockNumber: blockNumber.toString(),
    blockTime: timing.blockDuration,
    entityCount,
  };
}
