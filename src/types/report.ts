/**
 * ArkivPress: Whistleblower & Censorship-Resistant Bulletin Schema
 * SPDX-License-Identifier: MIT
 */

export type ReportTag = 
  | 'CORRUPTION'
  | 'PRESS_FREEDOM'
  | 'HUMAN_RIGHTS'
  | 'CLIMATE_SUPPRESSION'
  | 'SANCTIONS_EVASION'
  | 'FINANCIAL_FRAUD'
  | 'GOV_SURVEILLANCE';

export type ThreatLevel = 'LOW' | 'ELEVATED' | 'SEVERE' | 'CRITICAL';

export interface WhistleblowerReportPayload {
  version: '1.0.0';
  title: string;
  source: string;
  body: string;
  ipfsProofHash: string;
  timestamp: number; // Unix epoch milliseconds
  tag: ReportTag;
  threatLevel: ThreatLevel;
  jurisdiction: string;
  contentHash: string; // SHA-256 of canonical (title + source + body + ipfsProofHash)
  anonymityLevel: 'PSEUDONYMOUS' | 'AIR-GAPPED' | 'ZERO_KNOWLEDGE';
  verifiedSigner?: string;
}

export interface ArkivIndexedAttributes {
  tag: string;
  source: string;
  threatLevel: string;
  jurisdiction: string;
  timestamp: bigint;
  contentHash: string;
}

export interface PublishedArkivEntity {
  entityKey: string;
  txHash: string;
  blockNumber?: bigint | number;
  expiresAt: bigint | number;
  payload: WhistleblowerReportPayload;
  attributes: ArkivIndexedAttributes;
  isVerified: boolean;
  publishedAt: string;
}
