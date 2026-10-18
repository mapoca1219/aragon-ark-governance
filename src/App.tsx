/**
 * AragonArk: Censorship-Resistant Governance Engine & Public DAO Bulletin
 * Built on Arkiv (Tiramisu Testnet) + Aragon OSx
 *
 * SPDX-License-Identifier: MIT
 */
import React, { useState } from 'react';
import { NetworkStatusBadge } from './components/NetworkStatusBadge.js';
import { ProposalCard } from './components/ProposalCard.js';
import { VoteModal } from './components/VoteModal.js';
import { CreateProposalModal } from './components/CreateProposalModal.js';
import { TerminalSimulator } from './components/TerminalSimulator.js';
import { RubricViewer } from './components/RubricViewer.js';
import type { ProposalPayload, VoteReceiptPayload } from './types/governance.js';
import {
  Shield,
  Plus,
  Terminal,
  Layers,
  Search,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

const INITIAL_PROPOSALS: ProposalPayload[] = [
  {
    version: 'aragon-ark/v1.0',
    daoAddress: '0x12470C0D4b50c18d963fD8B781198547372dF139',
    proposalId: 'AIP-962',
    title: 'Establish Sovereign Whistleblower Legal Defense Treasury Vault',
    description:
      'Allocate 250,000 USDC from the Aragon DAO treasury to an unseizable multisig vault dedicated to defending investigative journalists and environmental whistleblowers facing state intimidation. Executed via Aragon OSx multisig plugin.',
    metadataURI: 'arkiv://bafybeidDefenseVaultManifest2026/proposal.json',
    creator: '0x037926c9EAf1AE73FBA75d8728754784989C53d9',
    votingStartTime: Math.floor(Date.now() / 1000) - 86400,
    votingEndTime: Math.floor(Date.now() / 1000) + 518400, // 6 days left
    actionPayload: [
      {
        to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        value: '0',
        data: '0xa9059cbb000000000000000000000000vaultAddress0000000000000000000000000000000000000000000000000000003a35294400',
      },
    ],
    status: 'ACTIVE',
    proposalHash: '0xb441cf1b971a67eebfa224532accf8e505c8f8de7e73d6c5bf438e33908f97b9',
    supportThresholdBps: 5000,
    minTurnoutBps: 2000,
  },
  {
    version: 'aragon-ark/v1.0',
    daoAddress: '0x12470C0D4b50c18d963fD8B781198547372dF139',
    proposalId: 'AIP-961',
    title: 'Deploy Anti-Censorship RPC Relay Mesh Nodes on Golem Network',
    description:
      'Fund decentralized infrastructure to route Aragon governance queries across censorship-resistant P2P relay nodes to prevent DNS hijacking and BGP routing attacks against governance portals.',
    metadataURI: 'arkiv://bafybeicRelayMeshNodeDeployment/proposal.json',
    creator: '0x71C84167F32BB836c0dE0B91f54E9e1f57913A17',
    votingStartTime: Math.floor(Date.now() / 1000) - 604800,
    votingEndTime: Math.floor(Date.now() / 1000) - 1000, // Ended
    actionPayload: [
      {
        to: '0x1234567890123456789012345678901234567890',
        value: '5000000000000000000',
        data: '0x',
      },
    ],
    status: 'EXECUTED',
    proposalHash: '0x882a6136d3ffebcbbf34191bb9961da883491f24d781bcf704772b8349bbef6c',
    supportThresholdBps: 5000,
    minTurnoutBps: 2000,
  },
  {
    version: 'aragon-ark/v1.0',
    daoAddress: '0x12470C0D4b50c18d963fD8B781198547372dF139',
    proposalId: 'AIP-960',
    title: 'Immunity Protocol: Automated Smart Contract Bounty Program',
    description:
      'Establish a 100,000 GLM security pool on Arkiv to reward ethical security researchers who discover state-sponsored surveillance backdoors in open source dApps.',
    metadataURI: 'arkiv://bafybeicImmunityProtocolSecurityPool/manifest.json',
    creator: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    votingStartTime: Math.floor(Date.now() / 1000) - 1209600,
    votingEndTime: Math.floor(Date.now() / 1000) - 604800,
    actionPayload: [],
    status: 'EXECUTED',
    proposalHash: '0x49f01bc91823901bcaeb019284718291bca981028716201bcefa01928374619b',
    supportThresholdBps: 5000,
    minTurnoutBps: 2000,
  },
];

const INITIAL_VOTES: VoteReceiptPayload[] = [
  {
    version: 'aragon-ark/v1.0',
    daoAddress: '0x12470C0D4b50c18d963fD8B781198547372dF139',
    proposalId: 'AIP-962',
    voter: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    voteOption: 'YES',
    votingPower: '45000000000000000000000',
    timestamp: Math.floor(Date.now() / 1000) - 40000,
    rationale:
      'Decentralized DAOs must provide physical and legal asylum for whistleblowers uncovering corruption.',
    signature:
      '0x57173f8ce0a8a0ca716bed547eeab48046b9a8cfd600cb817a15a0cbb17b6a715ffab9528022a101b44ecb9c24090b8fbcde16bf33bfa8614ce4bf38ab20bfa11b',
    voteReceiptHash: '0x49fd713279ae81d855600b35276976c73568121aec949455c470b1ad2ca5b28d',
  },
  {
    version: 'aragon-ark/v1.0',
    daoAddress: '0x12470C0D4b50c18d963fD8B781198547372dF139',
    proposalId: 'AIP-962',
    voter: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    voteOption: 'YES',
    votingPower: '32000000000000000000000',
    timestamp: Math.floor(Date.now() / 1000) - 30000,
    rationale:
      'Treasury funds are safe from freeze requests due to the multi-jurisdiction setup.',
    signature:
      '0x41ab982e0081d59baee8291471b0aa4f8b91cc0981b2eecc18471900bfcae91844b20a1748291f09bb2231abfcdde2901b088ffca010b9a91848bbceea28711c1c',
    voteReceiptHash: '0x10f81a7b8e01bf2849921bc9a491ef20188ca0b8b1a82987bbcef1921a9bbcd4',
  },
  {
    version: 'aragon-ark/v1.0',
    daoAddress: '0x12470C0D4b50c18d963fD8B781198547372dF139',
    proposalId: 'AIP-962',
    voter: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    voteOption: 'NO',
    votingPower: '12000000000000000000000',
    timestamp: Math.floor(Date.now() / 1000) - 20000,
    rationale:
      'Support the principle, but we should require a 3-of-5 advisory council approval before releasing tranches over 50k.',
    signature:
      '0x72ba91c019d4481bb20982bbfe38812c776481bb2091cbeea0011bba8829efca099184bcff1a88b2091726bbef011982bbfedc00192871bbca9188200bfa81bc1b',
    voteReceiptHash: '0x88921f00bfeac891bb0293847291bbca71829100faeebc09187361bbaf9812bc',
  },
  {
    version: 'aragon-ark/v1.0',
    daoAddress: '0x12470C0D4b50c18d963fD8B781198547372dF139',
    proposalId: 'AIP-961',
    voter: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    voteOption: 'YES',
    votingPower: '80000000000000000000000',
    timestamp: Math.floor(Date.now() / 1000) - 700000,
    rationale: 'Mesh relay nodes are fundamental to circumventing national firewalls.',
    signature:
      '0x3a4b91c019d4481bb20982bbfe38812c776481bb2091cbeea0011bba8829efca099184bcff1a88b2091726bbef011982bbfedc00192871bbca9188200bfa81bc1b',
    voteReceiptHash: '0x3344112233445566778899aabbccddeeff00112233445566778899aabbccddeeff',
  },
];

export default function App() {
  const [proposals, setProposals] = useState<ProposalPayload[]>(INITIAL_PROPOSALS);
  const [votes, setVotes] = useState<VoteReceiptPayload[]>(INITIAL_VOTES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXECUTED'>('ALL');
  const [activeView, setActiveView] = useState<'bulletin' | 'terminal' | 'rubric'>('bulletin');

  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);
  const [selectedProposalForVote, setSelectedProposalForVote] = useState<ProposalPayload | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  function handleOpenVote(proposal: ProposalPayload) {
    setSelectedProposalForVote(proposal);
    setIsVoteModalOpen(true);
  }

  function handleVoteSubmitted(newVote: VoteReceiptPayload) {
    setVotes((prev) => [newVote, ...prev]);
  }

  function handleProposalCreated(newProposal: ProposalPayload) {
    setProposals((prev) => [newProposal, ...prev]);
  }

  const filteredProposals = proposals.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesQuery =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.proposalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Banner & Live Network Status */}
      <header className="border-b border-stone-800 bg-stone-900/60 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-stone-950">
              <Shield className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-stone-100">
                  AragonArk
                </h1>
                <span className="bg-amber-400/10 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold border border-amber-400/20">
                  CROPS HACKATHON
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Censorship-Resistant Governance Engine & Public DAO Bulletin on Arkiv
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <NetworkStatusBadge />
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3.5 py-2 rounded-lg text-xs transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Proposal</span>
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex border-t border-stone-800/80">
          <button
            onClick={() => setActiveView('bulletin')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeView === 'bulletin'
                ? 'border-amber-500 text-amber-400 bg-stone-900/40'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Governance Bulletin ({proposals.length})</span>
          </button>

          <button
            onClick={() => setActiveView('terminal')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeView === 'terminal'
                ? 'border-amber-500 text-amber-400 bg-stone-900/40'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Interactive CLI Terminal</span>
          </button>

          <button
            onClick={() => setActiveView('rubric')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeView === 'rubric'
                ? 'border-amber-500 text-amber-400 bg-stone-900/40'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Rubric, Architecture & Friction</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        {activeView === 'bulletin' && (
          <div className="space-y-6">
            {/* Mission Hero Banner */}
            <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-amber-950/40 border border-stone-800 rounded-2xl p-6 relative overflow-hidden">
              <div className="max-w-3xl space-y-2">
                <span className="text-amber-400 font-mono text-xs font-semibold uppercase tracking-wider">
                  Decentralized Database Protocol • Arkiv Tiramisu Testnet
                </span>
                <h2 className="text-2xl font-black text-stone-100 tracking-tight">
                  Immutable Governance That Cannot Be Censored, Purged, or Subpoenaed
                </h2>
                <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
                  Traditional DAO voting relies on vulnerable Web2 frontends, central PostgreSQL servers, and IPFS pinning gateways that drop files during political crises. AragonArk anchors Aragon OSx proposals and signed EIP-191 voter ballots directly in Arkiv. Every record is permanent, queryable in milliseconds, and 100% auditable without Subgraphs.
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="bg-stone-800/80 border border-stone-700/60 px-3 py-1 rounded-full text-stone-300">
                  ⚡ Permanent Storage: <strong className="text-amber-400">ExpirationTime.permanent()</strong>
                </span>
                <span className="bg-stone-800/80 border border-stone-700/60 px-3 py-1 rounded-full text-stone-300">
                  🔐 EIP-191 Voter Signatures
                </span>
                <span className="bg-stone-800/80 border border-stone-700/60 px-3 py-1 rounded-full text-stone-300">
                  🛡️ Zero Heavy Indexer Nodes Required
                </span>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by ID, keyword, or action..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg pl-9 pr-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500 placeholder:text-stone-400"
                />
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
                <span className="text-stone-400 font-semibold mr-1">Status:</span>
                {(['ALL', 'ACTIVE', 'EXECUTED'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      statusFilter === st
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Proposals Grid */}
            <div className="grid grid-cols-1 gap-5">
              {filteredProposals.length > 0 ? (
                filteredProposals.map((proposal) => {
                  const proposalVotes = votes.filter(
                    (v) => v.proposalId === proposal.proposalId
                  );
                  return (
                    <ProposalCard
                      key={proposal.proposalId}
                      proposal={proposal}
                      votes={proposalVotes}
                      onVoteClick={handleOpenVote}
                    />
                  );
                })
              ) : (
                <div className="p-12 text-center bg-stone-900/40 border border-stone-800 rounded-xl space-y-2">
                  <p className="text-stone-400 text-sm">
                    No proposals matched your filter criteria.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('ALL');
                    }}
                    className="text-amber-400 text-xs font-bold hover:underline"
                  >
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'terminal' && (
          <div className="space-y-4">
            <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-800">
              <h3 className="font-bold text-stone-100 text-base mb-1">
                Interactive Backend Script Runner
              </h3>
              <p className="text-stone-400 text-xs">
                Test the complete CLI lifecycle: proposal creation, cryptographic EIP-191 vote casting, and decentralized query tallying without relying on external servers.
              </p>
            </div>
            <TerminalSimulator />
          </div>
        )}

        {activeView === 'rubric' && (
          <div className="space-y-4">
            <RubricViewer />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/80 bg-stone-900/50 py-6 text-xs text-stone-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-stone-300">AragonArk</span> • Built for the Arkiv Pre-Devcon Hackathon (CROPS Theme)
            <div className="text-[11px] text-stone-400 mt-0.5">
              Track: Censorship Resistance (Global) • Network: Tiramisu (7738577) • MIT License
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <a
              href="https://tiramisu.explorer.arkiv.network"
              target="_blank"
              rel="noreferrer"
              className="hover:text-stone-200 flex items-center gap-1"
            >
              <span>Tiramisu Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://rpc.tiramisu.db-chain.testnet.arkiv.network"
              target="_blank"
              rel="noreferrer"
              className="hover:text-stone-200 flex items-center gap-1"
            >
              <span>Testnet RPC</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/Arkiv-Network"
              target="_blank"
              rel="noreferrer"
              className="hover:text-stone-200 flex items-center gap-1"
            >
              <span>Arkiv SDK Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedProposalForVote && (
        <VoteModal
          proposal={selectedProposalForVote}
          isOpen={isVoteModalOpen}
          onClose={() => {
            setIsVoteModalOpen(false);
            setSelectedProposalForVote(null);
          }}
          onVoteSubmitted={handleVoteSubmitted}
        />
      )}

      <CreateProposalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onProposalCreated={handleProposalCreated}
      />
    </div>
  );
}
