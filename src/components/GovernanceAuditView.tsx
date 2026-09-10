import React from 'react';
import { SealedBidAuctionState } from '../types/ledger';

interface GovernanceAuditViewProps {
  contractState: SealedBidAuctionState;
  onCastVote: (vote: 'yes' | 'no') => void;
}

export const GovernanceAuditView: React.FC<GovernanceAuditViewProps> = ({ contractState, onCastVote }) => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        {/* Preserved Level 3 Governance Panel */}
        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <VoteIcon className="w-4 h-4 text-indigo-400" />
              <span>Level 3 Preserved Base Governance Voting</span>
            </h3>
            <div className="flex space-x-4 text-xs font-mono">
              <span className="text-emerald-400">YES Tally: {contractState.yesTally}</span>
              <span className="text-rose-400">NO Tally: {contractState.noTally}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onCastVote('yes')}
              className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50"
            >
              Cast Vote YES
            </button>
            <button
              onClick={() => onCastVote('no')}
              className="flex-1 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50"
            >
              Cast Vote NO
            </button>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div>
          <h3 className="text-sm font-bold text-white mb-3">On-Chain Audit Trail</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Tx Hash</th>
                  <th className="py-2 px-3">Action</th>
                  <th className="py-2 px-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {contractState.auditLogs.slice().reverse().map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-400">{log.txHash || 'N/A'}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{log.action}</td>
                    <td className="py-2.5 px-3 text-slate-300">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

function VoteIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 12 2 2 4-4" />
      <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z" />
      <path d="M22 19H2" />
    </svg>
  );
}
