/**
 * Cryptographic utility functions for report hashing, tamper verification, and IPFS CIDs
 * SPDX-License-Identifier: MIT
 */
import { createHash } from 'node:crypto';
import type { WhistleblowerReportPayload } from '../types/report.js';

/**
 * Computes canonical SHA-256 digest of report fields to ensure tamper resistance.
 */
export function computeReportHash(report: Pick<WhistleblowerReportPayload, 'title' | 'source' | 'body' | 'ipfsProofHash' | 'timestamp' | 'tag'>): string {
  const canonicalString = [
    report.title.trim(),
    report.source.trim(),
    report.tag.trim(),
    report.ipfsProofHash.trim(),
    report.timestamp.toString(),
    report.body.trim()
  ].join(':::');

  return '0x' + createHash('sha256').update(canonicalString, 'utf8').digest('hex');
}

/**
 * Validates if a report payload matches its claimed contentHash.
 */
export function verifyReportIntegrity(report: WhistleblowerReportPayload): boolean {
  if (!report.contentHash) return false;
  const recalculated = computeReportHash(report);
  return recalculated.toLowerCase() === report.contentHash.toLowerCase();
}

/**
 * Generates deterministic synthetic IPFS CIDv1 from data buffer.
 */
export function generateSyntheticIpfsCid(content: string): string {
  const hash = createHash('sha256').update(content, 'utf8').digest('hex');
  // Format as standard base32 CIDv1 prefix (bafybeic...)
  return `bafybeic${hash.slice(0, 48)}`;
}

/**
 * Validates entity attribute length constraints according to Arkiv protocol:
 * - Attribute names: 1-32 bytes
 * - String attribute values: <= 256 bytes
 */
export function validateArkivAttributeName(name: string): boolean {
  if (!name || name.length > 32) return false;
  return /^[A-Za-z][A-Za-z0-9._-]*$/.test(name);
}

export function truncateAddress(addr: string): string {
  if (!addr) return '';
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
