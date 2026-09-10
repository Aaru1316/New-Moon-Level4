import React from 'react';
import { Database } from 'lucide-react';
import { SealedBidAuctionState } from '../types/ledger';

interface LedgerExplorerViewProps {
  contractState: SealedBidAuctionState;
}

export const LedgerExplorerView: React.FC<LedgerExplorerViewProps> = ({ contractState }) => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Database className="w-5 h-5 text-emerald-400" />
          <span>Midnight / Cardano Preprod Explorer</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <h3 className="font-bold text-white text-sm">Ledger State Summary</h3>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Auction ID:</span>
              <span className="text-cyan-400">{contractState.auctionId}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Block Height:</span>
              <span className="text-white">#{contractState.blockHeight}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-900">
              <span className="text-slate-400">Total Bids Committed:</span>
              <span className="text-white">{contractState.bidCommitments.length}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Nullifier Tree Size:</span>
              <span className="text-indigo-400">{contractState.bidderNullifiers.length} Nullifiers</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
            <h3 className="font-bold text-white text-sm">On-Chain Nullifier Registry</h3>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {contractState.bidderNullifiers.length === 0 ? (
                <p className="text-slate-500 italic">No nullifiers spent yet.</p>
              ) : (
                contractState.bidderNullifiers.map((nullifier, i) => (
                  <div key={i} className="text-slate-400 hover:text-white truncate">
                    [{i + 1}] {nullifier}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
