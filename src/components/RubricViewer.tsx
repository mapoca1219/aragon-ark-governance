/**
 * AragonArk: Rubric, Architecture & Developer Friction Interactive Viewer
 * SPDX-License-Identifier: MIT
 */
import React, { useState } from 'react';
import {
  ShieldAlert,
  Layers,
  Database,
  Wrench,
  Video,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

export const RubricViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'harm' | 'why-arkiv' | 'schema' | 'friction' | 'video-script'
  >('harm');

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-xl">
      {/* Tab Navigation */}
      <div className="flex border-b border-stone-800 bg-stone-950/60 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('harm')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'harm'
              ? 'border-amber-500 text-amber-400 bg-stone-900'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>1. Harm Analysis & Pillar</span>
        </button>

        <button
          onClick={() => setActiveTab('why-arkiv')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'why-arkiv'
              ? 'border-amber-500 text-amber-400 bg-stone-900'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. Why Arkiv vs Alternatives</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'schema'
              ? 'border-amber-500 text-amber-400 bg-stone-900'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>3. Schema & Indexing Engine</span>
        </button>

        <button
          onClick={() => setActiveTab('friction')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'friction'
              ? 'border-amber-500 text-amber-400 bg-stone-900'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>4. Friction Report (arkiv/friction.md)</span>
        </button>

        <button
          onClick={() => setActiveTab('video-script')}
          className={`flex items-center gap-2 px-4 py-3 font-semibold whitespace-nowrap transition-colors border-b-2 ${
            activeTab === 'video-script'
              ? 'border-amber-500 text-amber-400 bg-stone-900'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>5. 60s Loom Video Script</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6 text-stone-300 text-xs sm:text-sm leading-relaxed space-y-4">
        {activeTab === 'harm' && (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
              <h4 className="font-bold text-amber-400 text-base mb-1">
                Evaluation Rubric 1: Harm Analysis If Governance Data Is Silenced
              </h4>
              <p className="text-stone-300 text-xs">
                Censorship resistance is not an abstract luxury; it is the boundary between sovereign coordination and systemic disenfranchisement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
                <div className="font-bold text-rose-400 text-sm">
                  1. Whistleblower & Legal Defense Funds
                </div>
                <p className="text-stone-400">
                  When DAOs coordinate defense funds for investigative journalists or environmental whistleblowers, centralized frontends face subpoenas and DNS seizures. If proposal text and multisig execution payloads are deleted, signers cannot verify the intent of transactions, causing emergency funding to stall while whistleblowers face incarceration.
                </p>
              </div>

              <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
                <div className="font-bold text-rose-400 text-sm">
                  2. Suppression of Dissenting Minority
                </div>
                <p className="text-stone-400">
                  In contentious treasury forks and protocol reorganizations, centralized Web2 operators have routinely hidden or purged dissenting votes and rationales. Removing the minority's voice fabricates artificial consensus and destroys DAO governance legitimacy.
                </p>
              </div>

              <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
                <div className="font-bold text-rose-400 text-sm">
                  3. Fiduciary & Legal Peril
                </div>
                <p className="text-stone-400">
                  Without an immutable, independently verifiable record proving what proposal version was voted on and when quorum was attained, tokenholders face legal vulnerability in decentralized arbitrations and court challenges.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'why-arkiv' && (
          <div className="space-y-4">
            <h4 className="font-bold text-stone-100 text-base">
              Why Arkiv? Comprehensive Breakdown vs Other Architectures
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 font-mono">
                    <th className="py-2.5 px-3">Dimension</th>
                    <th className="py-2.5 px-3">Centralized PostgreSQL</th>
                    <th className="py-2.5 px-3">Decentralized IPFS</th>
                    <th className="py-2.5 px-3">The Graph (Subgraphs)</th>
                    <th className="py-2.5 px-3 text-amber-400 bg-amber-400/5">
                      AragonArk on Arkiv
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  <tr>
                    <td className="py-3 px-3 font-semibold text-stone-200">Tamper-Proofing</td>
                    <td className="py-3 px-3 text-rose-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>DB admin can alter/drop rows</span>
                    </td>
                    <td className="py-3 px-3 text-amber-400">Content-addressed, but pinning drops</td>
                    <td className="py-3 px-3 text-amber-400">Indexers can omit events</td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold bg-amber-400/5">
                      <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                      Consensus state root + permanent keys
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-stone-200">Native Queryability</td>
                    <td className="py-3 px-3 text-emerald-400">Rich SQL queries</td>
                    <td className="py-3 px-3 text-rose-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Zero queries; flat CIDs only</span>
                    </td>
                    <td className="py-3 px-3 text-emerald-400">GraphQL (if indexed)</td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold bg-amber-400/5">
                      <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                      Sub-second indexed query builder
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-stone-200">Infrastructure Burden</td>
                    <td className="py-3 px-3 text-stone-400">Servers, backups, firewalls</td>
                    <td className="py-3 px-3 text-stone-400">Paid Pinata / Infura gateways</td>
                    <td className="py-3 px-3 text-rose-400 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Heavy node / archive sync</span>
                    </td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold bg-amber-400/5">
                      <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                      Zero indexers needed; direct RPC queries
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-semibold text-stone-200">Storage Retention</td>
                    <td className="py-3 px-3 text-stone-400">Billing expiration risks</td>
                    <td className="py-3 px-3 text-rose-400">Garbage-collected if unpinned</td>
                    <td className="py-3 px-3 text-stone-400">Tied to indexing credits</td>
                    <td className="py-3 px-3 text-emerald-400 font-semibold bg-amber-400/5">
                      <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                      ExpirationTime.permanent() protocol guarantee
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="space-y-4">
            <h4 className="font-bold text-stone-100 text-base">
              Dual-Layer Entity Architecture on Arkiv
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
                <div className="font-bold text-amber-400 text-sm">
                  1. ProposalEntity (`DAO_PROPOSAL`)
                </div>
                <div className="text-stone-400 text-[11px]">INDEXED ATTRIBUTES:</div>
                <ul className="list-disc pl-4 space-y-1 text-stone-300">
                  <li><code className="text-sky-400">entityType</code>: str("DAO_PROPOSAL")</li>
                  <li><code className="text-sky-400">daoAddress</code>: str(0x...)</li>
                  <li><code className="text-sky-400">proposalId</code>: str("AIP-962")</li>
                  <li><code className="text-sky-400">status</code>: str("ACTIVE")</li>
                  <li><code className="text-sky-400">startTime</code>: u64(timestamp)</li>
                  <li><code className="text-sky-400">endTime</code>: u64(timestamp)</li>
                  <li><code className="text-sky-400">proposalHash</code>: str(0x...)</li>
                </ul>
              </div>

              <div className="p-4 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
                <div className="font-bold text-amber-400 text-sm">
                  2. VoteReceiptEntity (`DAO_VOTE`)
                </div>
                <div className="text-stone-400 text-[11px]">INDEXED ATTRIBUTES:</div>
                <ul className="list-disc pl-4 space-y-1 text-stone-300">
                  <li><code className="text-sky-400">entityType</code>: str("DAO_VOTE")</li>
                  <li><code className="text-sky-400">daoAddress</code>: str(0x...)</li>
                  <li><code className="text-sky-400">proposalId</code>: str("AIP-962")</li>
                  <li><code className="text-sky-400">voter</code>: str(0x...)</li>
                  <li><code className="text-sky-400">voteOption</code>: str("YES" | "NO")</li>
                  <li><code className="text-sky-400">timestamp</code>: u64(timestamp)</li>
                  <li><code className="text-sky-400">voteHash</code>: str(0x...)</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'friction' && (
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-stone-100 text-base">
              Key Developer Friction Takeaways (`arkiv/friction.md`)
            </h4>
            <div className="space-y-2.5">
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-lg">
                <div className="font-semibold text-amber-400 mb-1">
                  1. RPC Gas Error Diagnostics
                </div>
                <p className="text-stone-400">
                  Unfunded accounts receive a generic <code className="text-stone-300">EntityMutationError: Transaction failed: Execution error without revert data</code>. Adding typed <code className="text-stone-300">InsufficientGasBalanceError</code> with faucet links will dramatically improve onboarding.
                </p>
              </div>

              <div className="p-3 bg-stone-950 border border-stone-800 rounded-lg">
                <div className="font-semibold text-amber-400 mb-1">
                  2. Address Indexing Normalization
                </div>
                <p className="text-stone-400">
                  Because string attribute indices are strict byte comparisons, checksummed <code className="text-stone-300">0xAbC...</code> fails to match lowercase <code className="text-stone-300">0xabc...</code>. A native <code className="text-stone-300">addr(...)</code> tag with EIP-55 normalization solves this.
                </p>
              </div>

              <div className="p-3 bg-stone-950 border border-stone-800 rounded-lg">
                <div className="font-semibold text-amber-400 mb-1">
                  3. Batch Nonce Invalidation
                </div>
                <p className="text-stone-400">
                  When using <code className="text-stone-300">predictEntityKeys</code> for batch execution, any concurrent create transaction from the same address invalidates the predicted salt and causes batch reverts.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'video-script' && (
          <div className="space-y-3 font-mono text-xs bg-stone-950 p-4 rounded-xl border border-stone-800">
            <div className="font-bold text-amber-400 text-sm mb-2">
              60-Second Demo Loom Video Script
            </div>
            <div className="text-stone-300 space-y-2">
              <div>
                <strong className="text-stone-200">00:00 - 00:10 (Hook & Problem)</strong><br />
                "Hi everyone, this is AragonArk for the Arkiv Pre-Devcon Hackathon. When DAOs are targeted by censorship, frontends get taken down, IPFS gateways drop unpinned files, and indexers desync. Here is how we solved it with Arkiv."
              </div>
              <div>
                <strong className="text-stone-200">00:10 - 00:25 (Publishing Proposal)</strong><br />
                "[Terminal] I run `npm run create:proposal`. We build an Aragon OSx proposal with permanent retention (`ExpirationTime.permanent()`), calculate its canonical keccak256 hash, and index it directly in Arkiv on Tiramisu testnet."
              </div>
              <div>
                <strong className="text-stone-200">00:25 - 00:40 (Casting Censorship-Proof Votes)</strong><br />
                "[Terminal] Next, a voter signs an EIP-191 ballot. Running `npm run cast:vote` creates an immutable `VoteReceiptEntity` with rationale and weight. Even if the website is seized, this ballot is permanently recorded on-chain."
              </div>
              <div>
                <strong className="text-stone-200">00:40 - 00:55 (Direct Query & Tally)</strong><br />
                "[Terminal] Running `npm run query:governance AIP-962` queries Arkiv directly. There are NO subgraphs and NO central databases. The client fetches the entities, verifies every signature and proposal hash for 100% untampered integrity, and tallies the vote."
              </div>
              <div>
                <strong className="text-stone-200">00:55 - 01:00 (Conclusion)</strong><br />
                "[Explorer] Here is the transaction confirmed on `tiramisu.explorer.arkiv.network`. AragonArk makes DAO governance un-censorable, permanent, and sovereign. Thank you!"
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
