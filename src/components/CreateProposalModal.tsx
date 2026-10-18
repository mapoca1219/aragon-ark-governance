/**
 * AragonArk: Create Proposal Modal Component
 * Builds an Aragon OSx proposal with executable calldata actions and persists to Arkiv DB
 * SPDX-License-Identifier: MIT
 */
import React, { useState } from 'react';
import type { ProposalPayload, DAOAction } from '../types/governance.js';
import { computeProposalHash } from '../utils/governanceCrypto.js';
import { X, Plus, Trash2, ShieldCheck, Loader2 } from 'lucide-react';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProposalCreated: (proposal: ProposalPayload) => void;
}

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  isOpen,
  onClose,
  onProposalCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [daoAddress, setDaoAddress] = useState(
    '0x12470C0D4b50c18d963fD8B781198547372dF139'
  );
  const [durationDays, setDurationDays] = useState('7');
  const [actions, setActions] = useState<DAOAction[]>([
    {
      to: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      value: '0',
      data: '0xa9059cbb000000000000000000000000WhistleblowerVault0000000000000000000000000000000000000000000000000000003a35294400',
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  function handleAddAction() {
    setActions([
      ...actions,
      { to: '0x0000000000000000000000000000000000000000', value: '0', data: '0x' },
    ]);
  }

  function handleRemoveAction(idx: number) {
    setActions(actions.filter((_, i) => i !== idx));
  }

  function handleActionChange(idx: number, field: keyof DAOAction, value: string) {
    const updated = [...actions];
    updated[idx][field] = value;
    setActions(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const now = Math.floor(Date.now() / 1000);
      const days = parseInt(durationDays, 10) || 7;
      const proposalId = `AIP-${Math.floor(100 + Math.random() * 900)}`;

      const baseProposal: Omit<ProposalPayload, 'proposalHash'> = {
        version: 'aragon-ark/v1.0',
        daoAddress: daoAddress.trim(),
        proposalId,
        title: title.trim(),
        description: description.trim(),
        metadataURI: `arkiv://bafybeid${proposalId}GovernanceManifest/meta.json`,
        creator: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        votingStartTime: now,
        votingEndTime: now + days * 86400,
        actionPayload: actions,
        status: 'ACTIVE',
        supportThresholdBps: 5000,
        minTurnoutBps: 2000,
      };

      const proposalHash = computeProposalHash(baseProposal);
      const fullProposal: ProposalPayload = {
        ...baseProposal,
        proposalHash,
      };

      // Simulate network broadcast
      await new Promise((r) => setTimeout(r, 600));

      onProposalCreated(fullProposal);
      onClose();
    } catch (err: any) {
      console.error('Failed to create proposal:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold text-amber-400">
              ARAGON OSX • ARKIV DB
            </span>
            <h2 className="text-lg font-bold text-stone-100">
              Create Censorship-Resistant DAO Proposal
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 p-1 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-stone-300 font-semibold mb-1">
              Proposal Title:
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Authorize Emergency Whistleblower Asylum Protocol"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Target Aragon DAO Contract Address:
              </label>
              <input
                type="text"
                required
                value={daoAddress}
                onChange={(e) => setDaoAddress(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono text-[11px] focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Voting Period (Days):
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-stone-100 font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-300 font-semibold mb-1">
              Proposal Narrative & Governance Rationale:
            </label>
            <textarea
              rows={4}
              required
              placeholder="Detail the ethical necessity, treasury impact, and execution strategy..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-2.5 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Executable Actions Section */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-stone-300">
                Aragon OSx Executable Actions ({actions.length})
              </span>
              <button
                type="button"
                onClick={handleAddAction}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Action</span>
              </button>
            </div>

            <div className="space-y-3">
              {actions.map((act, i) => (
                <div
                  key={i}
                  className="p-3 bg-stone-950 border border-stone-800 rounded-lg space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-stone-400">
                      ACTION #{i + 1}
                    </span>
                    {actions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAction(i)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-stone-400">Target Address:</span>
                      <input
                        type="text"
                        value={act.to}
                        onChange={(e) => handleActionChange(i, 'to', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded px-2 py-1 text-stone-200 font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400">Value (Wei):</span>
                      <input
                        type="text"
                        value={act.value}
                        onChange={(e) => handleActionChange(i, 'value', e.target.value)}
                        className="w-full bg-stone-900 border border-stone-800 rounded px-2 py-1 text-stone-200 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400">Hex Calldata:</span>
                    <input
                      type="text"
                      value={act.data}
                      onChange={(e) => handleActionChange(i, 'data', e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded px-2 py-1 text-stone-200 font-mono text-[10px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-stone-950/80 p-3 rounded-lg border border-stone-800 text-[11px] text-stone-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              This proposal will be assigned <code className="text-amber-400">ExpirationTime.permanent()</code>{' '}
              on Arkiv, guaranteeing that neither DAO admins nor state regulators can purge or censor the vote history.
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
                  <span>Submitting to Arkiv...</span>
                </>
              ) : (
                <span>Publish to Arkiv DB</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
