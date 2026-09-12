import React from 'react';
import { Lock } from 'lucide-react';
import { SealedBidAuctionState } from '../../types/ledger';

interface EscrowVaultViewProps {
  contractState: SealedBidAuctionState;
}

export const EscrowVaultView: React.FC<EscrowVaultViewProps> = ({ contractState }) => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              <span>Trustless Escrow Vault & Automated Refund Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Bidders lock ttDUST token collateral upon bid commitment. Winning funds transfer to seller while losing bidders receive instant automated refunds.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">TOTAL VAULT COLLATERAL</span>
            <span className="text-xl font-bold font-mono text-cyan-400">{contractState.totalEscrowLocked} ttDUST</span>
          </div>
        </div>

        {/* Escrow Commitment Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase">
                <th className="py-3 px-4">Bidder Address</th>
                <th className="py-3 px-4">Lot ID</th>
                <th className="py-3 px-4">Escrow Amount</th>
                <th className="py-3 px-4">Commitment Hash</th>
                <th className="py-3 px-4">Escrow Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {contractState.bidCommitments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500">
                    No active escrow commitments registered on ledger yet.
                  </td>
                </tr>
              ) : (
                contractState.bidCommitments.map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 text-white font-bold">{entry.bidderAddress.substring(0, 14)}...</td>
                    <td className="py-3 px-4 text-cyan-400">{entry.lotId}</td>
                    <td className="py-3 px-4 text-emerald-400 font-bold">{entry.escrowAmount} ttDUST</td>
                    <td className="py-3 px-4 text-slate-400">{entry.commitment.substring(0, 16)}...</td>
                    <td className="py-3 px-4">
                      {entry.isRefunded ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-400 border border-purple-800">
                          Refunded to Wallet
                        </span>
                      ) : entry.isEscrowLocked ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800">
                          Collateral Locked
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400">
                          Released
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
