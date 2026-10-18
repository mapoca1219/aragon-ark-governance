import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeReportHash,
  verifyReportIntegrity,
  generateSyntheticIpfsCid,
  validateArkivAttributeName,
  truncateAddress,
} from './crypto.ts';
import type { WhistleblowerReportPayload } from '../types/report.ts';

test('computeReportHash produces deterministic 32-byte hex hash with 0x prefix', () => {
  const mockReport = {
    title: 'Offshore Sanctions Leak',
    source: 'Anonymous Customs Inspector',
    body: 'Wharf manifest logs show redirected shipments.',
    ipfsProofHash: 'bafybeic7346823764872364872364',
    timestamp: 1729290000000,
    tag: 'SANCTIONS_EVASION' as const,
  };

  const hash1 = computeReportHash(mockReport);
  const hash2 = computeReportHash(mockReport);

  assert.equal(hash1, hash2);
  assert.equal(hash1.startsWith('0x'), true);
  assert.equal(hash1.length, 66); // '0x' + 64 hex characters = 66
});

test('verifyReportIntegrity detects tampering', () => {
  const payload: WhistleblowerReportPayload = {
    version: '1.0.0',
    title: 'Suppressed Emission Data in Region 4',
    source: 'EPA Senior Analyst (Alias)',
    body: 'Nitrogen dioxide levels exceeded statutory ceilings by 412%.',
    ipfsProofHash: 'bafybeicabc123',
    timestamp: 1729291111000,
    tag: 'CLIMATE_SUPPRESSION',
    threatLevel: 'SEVERE',
    jurisdiction: 'US-EPA-R4',
    contentHash: '',
    anonymityLevel: 'AIR-GAPPED',
  };

  payload.contentHash = computeReportHash(payload);
  assert.equal(verifyReportIntegrity(payload), true);

  // Tamper with body
  const tamperedPayload = { ...payload, body: 'Nitrogen dioxide levels were completely fine.' };
  assert.equal(verifyReportIntegrity(tamperedPayload), false);
});

test('generateSyntheticIpfsCid formats valid CIDv1 prefix', () => {
  const cid = generateSyntheticIpfsCid('secret evidence manifest document');
  assert.equal(cid.startsWith('bafybeic'), true);
  assert.equal(cid.length > 20, true);
});

test('validateArkivAttributeName enforces protocol grammar rules', () => {
  assert.equal(validateArkivAttributeName('tag'), true);
  assert.equal(validateArkivAttributeName('source_id'), true);
  assert.equal(validateArkivAttributeName('threat.level'), true);
  assert.equal(validateArkivAttributeName('custom-meta'), true);

  // Invalid cases
  assert.equal(validateArkivAttributeName(''), false);
  assert.equal(validateArkivAttributeName('1starts_with_digit'), false);
  assert.equal(validateArkivAttributeName('contains space'), false);
  assert.equal(validateArkivAttributeName('a'.repeat(33)), false); // > 32 bytes
});

test('truncateAddress truncates EVM address cleanly', () => {
  const addr = '0xA268fF3779FFd2C8824DBb791A86ceA2bD0Ccf43';
  assert.equal(truncateAddress(addr), '0xA268...cf43');
  assert.equal(truncateAddress(''), '');
  assert.equal(truncateAddress('short'), 'short');
});
