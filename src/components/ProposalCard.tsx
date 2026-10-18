/**
 * AragonArk: Proposal Card Component with Live Vote Tally and Tamper Verification
 * SPDX-License-Identifier: MIT
 */
import React, { useState } from 'react';
import type { ProposalPayload, VoteReceiptPayload } from '../types/governance.js';
import {
  formatVotingPower,
  computeGovernanceTally,
  computeProposalHash,
} from '../utils/governanceCrypto.js';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileCode2,
  Vote,
  ExternalLink,
} from 'lucide-react';

interface ProposalCardProps {
  proposal: ProposalPayload;
  votes: VoteReceiptPayload[];
  onVoteClick: (proposal: ProposalPayload) => void;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  votes,
  onVoteClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const tally = computeGovernanceTally(proposal.proposalId, proposal.daoAddress, votes);

  const totalDecisive = tally.yesPower + tally.noPower;
  const yesPercentage =
    totalDecisive > 0n
      ? Number((tally.yesPower * 10000n) / totalDecisive) / 100
      : 0;
  const noPercentage =
    totalDecisive > 0n
      ? Number((tally.noPower * 10000n) / totalDecisive) / 100
      : 0;

  // Immutability check
  const calculatedHash = computeProposalHash(proposal);
  const isUntampered =
    calculatedHash.toLowerCase() === proposal.proposalHash.toLowerCase();

  const isExpired = Date.now() / 1000 > proposal.votingEndTime;

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg transition-all hover:border-stone-700">
      {/* Header */}
      <div className="p-5 border-b border-stone-800/80">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded text-xs border border-amber-400/20">
              {proposal.proposalId}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                proposal.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-stone-700/30 text-stone-300'
              }`}
            >
              {proposal.status}
            </span>
            {isUntampered && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Arkiv Untampered
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {isExpired
                ? 'Voting Concluded'
                : `Ends: ${new Date(proposal.votingEndTime * 1000).toLocaleDateString()}`}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-stone-100 hover:text-amber-300 transition-colors">
          {proposal.title}
        </h3>

        <p className="mt-2 text-stone-300 text-sm leading-relaxed line-clamp-3">
          {proposal.description}
        </p>

        {/* Voting Progress Bar */}
        <div className="mt-4 pt-4 border-t border-stone-800/60">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-emerald-400">
              YES {yesPercentage.toFixed(1)}% ({formatVotingPower(tally.yesPower)})
            </span>
            <span className="text-rose-400">
              NO {noPercentage.toFixed(1)}% ({formatVotingPower(tally.noPower)})
            </span>
          </div>

          <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${yesPercentage}%` }}
            />
            <div
              className="bg-rose-500 transition-all duration-500"
              style={{ width: `${noPercentage}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-stone-400">
            <span>
              Total Votes Cast:{' '}
              <strong className="text-stone-200">{tally.totalVotesCount}</strong>
            </span>
            <span>
              Current Outcome:{' '}
              <strong
                className={
                  tally.outcome === 'PASSING' ? 'text-emerald-400' : 'text-rose-400'
                }
              >
                {tally.outcome}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 bg-stone-950/60 flex items-center justify-between text-xs">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-stone-400 hover:text-stone-200 transition-colors"
        >
          {isExpanded ? (
            <>
              <span>Hide Dissent & Details</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>View Dissent & Execution Calldata</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        <button
          onClick={() => onVoteClick(proposal)}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
        >
          <Vote className="w-3.5 h-3.5" />
          <span>Cast Ballot</span>
        </button>
      </div>

      {/* Expandable Section */}
      {isExpanded && (
        <div className="p-5 bg-stone-950/90 border-t border-stone-800 space-y-4 text-xs">
          {/* Canonical Hash Info */}
          <div className="bg-stone-900/90 p-3 rounded-lg border border-stone-800">
            <div className="text-stone-400 font-mono text-[11px] mb-1">
              CANONICAL KECCAK256 HASH (TAMPER-PROOF)
            </div>
            <div className="font-mono text-emerald-400 break-all text-[11px]">
              {proposal.proposalHash}
            </div>
            <div className="mt-1 text-stone-400 text-[10px]">
              DAO Contract: {proposal.daoAddress} • Submitter: {proposal.creator}
            </div>
          </div>

          {/* Aragon OSx Executable Actions */}
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-stone-300 mb-2">
              <FileCode2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Aragon OSx Executable Actions ({proposal.actionPayload?.length || 0})</span>
            </div>
            {proposal.actionPayload && proposal.actionPayload.length > 0 ? (
              <div className="space-y-2 font-mono text-[11px]">
                {proposal.actionPayload.map((action, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-stone-900 border border-stone-800 rounded text-stone-300"
                  >
                    <div>Target: <span className="text-amber-400">{action.to}</span></div>
                    <div>Value: <span className="text-stone-400">{action.value} Wei</span></div>
                    <div className="break-all text-stone-400">
                      Calldata: {action.data}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-400 italic">No direct EVM execution actions attached.</p>
            )}
          </div>

          {/* Dissent & Signed Ballots Audit Log */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-semibold text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Signed Vote Receipts on Arkiv DB ({votes.length})</span>
              </div>
              <a
                href={`https://tiramisu.explorer.arkiv.network/address/${proposal.daoAddress}`}
                target="_blank"
                rel="noreferrer"
                className="text-stone-400 hover:text-stone-200 flex items-center gap-1 text-[11px]"
              >
                <span>Verify on Explorer</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-2">
              {votes.map((v, i) => (
                <div
                  key={i}
                  className="p-3 bg-stone-900/70 border border-stone-800/80 rounded-lg text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-stone-300 font-semibold">
                      {v.voter.slice(0, 8)}...{v.voter.slice(-6)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.voteOption === 'YES'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : v.voteOption === 'NO'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-stone-700 text-stone-300'
                      }`}
                    >
                      {v.voteOption} ({formatVotingPower(v.votingPower)})
                    </span>
                  </div>
                  <p className="text-stone-300 italic mb-1.5">"{v.rationale}"</p>
                  <div className="font-mono text-[10px] text-stone-400 truncate">
                    Signature: {v.signature.slice(0, 36)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
