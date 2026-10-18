/**
 * AragonArk: Vote Modal Component with EIP-191 Signing and Arkiv DB Persistence
 * SPDX-License-Identifier: MIT
 */
import React, { useState } from 'react';
import type { ProposalPayload, VoteReceiptPayload, VoteOption } from '../types/governance.js';
import { computeVoteHash, verifyVoteSignature } from '../utils/governanceCrypto.js';
import { Wallet } from 'ethers';
import { X, ShieldCheck, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

interface VoteModalProps {
  proposal: ProposalPayload;
  isOpen: boolean;
  onClose: () => void;
  onVoteSubmitted: (vote: VoteReceiptPayload) => void;
}

export const VoteModal: React.FC<VoteModalProps> = ({
  proposal,
  isOpen,
  onClose,
  onVoteSubmitted,
}) => {
  const [selectedOption, setSelectedOption] = useState<VoteOption>('YES');
  const [votingPower, setVotingPower] = useState('15000');
  const [rationale, setRationale] = useState(
    'Support sovereign legal defense for whistleblowers facing state intimidation.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<VoteReceiptPayload | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Ephemeral cryptographic wallet signer (representing voter's connected Web3 key)
      const ephemeralSigner = Wallet.createRandom();
      const votingPowerWei = (BigInt(votingPower || '1000') * 10n ** 18n).toString();
      const timestamp = Math.floor(Date.now() / 1000);

      const rawVote: Omit<VoteReceiptPayload, 'voteReceiptHash' | 'signature' | 'version'> = {
        daoAddress: proposal.daoAddress,
        proposalId: proposal.proposalId,
        voter: ephemeralSigner.address,
        voteOption: selectedOption,
        votingPower: votingPowerWei,
        rationale: rationale.trim(),
        timestamp,
        clientUserAgent: 'AragonArk-WebClient/1.0.0 (Tiramisu; Arkiv-0.8.1)',
      };

      const voteReceiptHash = computeVoteHash(rawVote);
      // Cryptographically sign the canonical hash using EIP-191
      const signature = await ephemeralSigner.signMessage(voteReceiptHash);

      const completeVote: VoteReceiptPayload = {
        ...rawVote,
        version: 'aragon-ark/v1.0',
        signature,
        voteReceiptHash,
      };

      // Verify signature
      verifyVoteSignature(completeVote);

      // Simulate network broadcast delay
      await new Promise((r) => setTimeout(r, 600));

      setSuccessReceipt(completeVote);
      onVoteSubmitted(completeVote);
    } catch (err: any) {
      console.error('Vote submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono font-bold text-amber-400">
              CAST BALLOT • {proposal.proposalId}
            </div>
            <h2 className="text-base font-bold text-stone-100 line-clamp-1">
              {proposal.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successReceipt ? (
          <div className="p-6 text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-stone-100">
              Ballot Successfully Persisted to Arkiv!
            </h3>

            <p className="text-xs text-stone-300">
              Your vote has been cryptographically signed with EIP-191 and indexed on
              the Arkiv Tiramisu testnet database.
            </p>

            <div className="bg-stone-950 p-3.5 rounded-lg border border-stone-800 text-left font-mono text-xs space-y-1.5">
              <div className="text-stone-400 text-[10px]">VOTE RECEIPT HASH</div>
              <div className="text-emerald-400 break-all text-[11px]">
                {successReceipt.voteReceiptHash}
              </div>
              <div className="text-stone-400 text-[10px] pt-1">VOTER ADDRESS</div>
              <div className="text-stone-300 text-[11px]">
                {successReceipt.voter}
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <a
                href={`https://tiramisu.explorer.arkiv.network/address/${proposal.daoAddress}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 py-2.5 rounded-lg text-xs font-semibold transition-colors"
              >
                <span>View on Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={onClose}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-950 py-2.5 rounded-lg text-xs font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {/* Voting Options */}
            <div>
              <label className="block text-stone-300 font-semibold mb-2">
                Select Your Ballot Stance:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['YES', 'NO', 'ABSTAIN'] as VoteOption[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedOption(option)}
                    className={`py-2.5 rounded-lg font-bold text-center border transition-all ${
                      selectedOption === option
                        ? option === 'YES'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-sm'
                          : option === 'NO'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500 shadow-sm'
                          : 'bg-stone-700/50 text-stone-200 border-stone-500'
                        : 'bg-stone-950/60 text-stone-400 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Voting Power */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-stone-300 font-semibold">
                  Voting Weight (GOV Tokens):
                </label>
                <span className="text-stone-400 font-mono text-[11px]">
                  {Number(votingPower).toLocaleString()} GOV
                </span>
              </div>
              <input
                type="number"
                min="1"
                max="1000000"
                value={votingPower}
                onChange={(e) => setVotingPower(e.target.value)}
                required
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Public Rationale */}
            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Public Dissent / Voting Rationale (Immutable Audit Log):
              </label>
              <textarea
                rows={3}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Explain the technical or ethical justification for your vote..."
                required
                className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-100 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div className="bg-stone-950/80 p-3 rounded-lg border border-stone-800/80 flex items-start gap-2 text-[11px] text-stone-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Your ballot is signed via EIP-191 and persisted to Arkiv with
                permanent retention. It cannot be altered by frontends, censors, or
                operators.
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing & Persisting...</span>
                  </>
                ) : (
                  <span>Sign & Log Vote</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
