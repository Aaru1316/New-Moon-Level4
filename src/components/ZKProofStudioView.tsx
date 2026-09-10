import React from 'react';
import { Cpu, CheckCircle2, XCircle } from 'lucide-react';
import { ProofLogEntry } from '../hooks/useAuctionNetwork';

interface ZKProofStudioViewProps {
  proofLog: ProofLogEntry[];
}

export const ZKProofStudioView: React.FC<ZKProofStudioViewProps> = ({ proofLog }) => {
  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>Zero-Knowledge Proof & Constraint Studio</span>
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Inspect Groth16/Plonk SNARK proof payloads ($\pi_A, \pi_B, \pi_C$) and inequality verification pipelines.
        </p>

        {/* Execution Steps Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {proofLog.length === 0 ? (
            <div className="col-span-3 p-8 text-center text-slate-500 text-xs bg-slate-950/60 rounded-xl border border-slate-800">
              No proof verification executed yet. Trigger "Verify ZK Winner" on an auction lot to inspect proof logs.
            </div>
          ) : (
            proofLog.map((log, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border space-y-2 ${
                  log.status === 'passed'
                    ? 'bg-emerald-950/30 border-emerald-800/60'
                    : log.status === 'failed'
                    ? 'bg-rose-950/30 border-rose-800/60'
                    : 'bg-cyan-950/30 border-cyan-800/60 animate-pulse'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white">{log.step}</span>
                  {log.status === 'passed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {log.status === 'failed' && <XCircle className="w-4 h-4 text-rose-400" />}
                </div>
                <p className="text-xs text-slate-300 font-mono">{log.detail}</p>
              </div>
            ))
          )}
        </div>

        {/* Simulated SNARK Matrix Representation */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Circuit Constraint Matrix ($\pi_A, \pi_B, \pi_C$)</h3>
          <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 border border-slate-800 overflow-x-auto space-y-2">
            <p><span className="text-purple-400">pi_a:</span> ["0xzk_811c9dc5243f6a88...", "0xzk_010001931000193..."]</p>
            <p><span className="text-indigo-400">pi_b:</span> [["0xzk_auction_id...", "0xzk_nullifier..."], ["0xzk_winning_amount...", "0xzk_valid_flag..."]]</p>
            <p><span className="text-emerald-400">pi_c:</span> ["0xzk_range_proof_pass...", "0xzk_lot_commitments_count..."]</p>
          </div>
        </div>
      </div>
    </div>
  );
};
