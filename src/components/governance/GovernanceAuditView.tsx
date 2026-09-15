import React, { useState } from 'react';
import {
  FileCheck,
  Vote,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Lock,
  Folder,
  Coins,
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { SealedBidAuctionState } from '../../types/ledger';

interface GovernanceAuditViewProps {
  contractState: SealedBidAuctionState;
  onCastVote: (vote: 'yes' | 'no') => void;
}

export const GovernanceAuditView: React.FC<GovernanceAuditViewProps> = ({ contractState, onCastVote }) => {
  const [selectedActionFilter, setSelectedActionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const totalVotes = contractState.yesTally + contractState.noTally;
  const yesPercent = totalVotes > 0 ? Math.round((contractState.yesTally / totalVotes) * 100) : 50;
  const noPercent = totalVotes > 0 ? 100 - yesPercent : 50;

  const logs = contractState.auditLogs || [];

  const filteredLogs = logs.slice().reverse().filter(log => {
    const matchesFilter =
      selectedActionFilter === 'all' ||
      (selectedActionFilter === 'bids' && (log.action.includes('BID') || log.action.includes('COMMIT'))) ||
      (selectedActionFilter === 'escrow' && (log.action.includes('ESCROW') || log.action.includes('REFUND'))) ||
      (selectedActionFilter === 'reveal' && (log.action.includes('REVEAL') || log.action.includes('VERIF'))) ||
      (selectedActionFilter === 'folders' && (log.action.includes('FOLDER') || log.action.includes('FILE'))) ||
      (selectedActionFilter === 'vote' && log.action.includes('VOTE'));

    const matchesSearch =
      searchQuery === '' ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.txHash && log.txHash.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const getActionIcon = (action: string) => {
    if (action.includes('BID')) return <Lock className="w-3.5 h-3.5 text-cyan-400" />;
    if (action.includes('REFUND') || action.includes('ESCROW')) return <Coins className="w-3.5 h-3.5 text-purple-400" />;
    if (action.includes('VERIF') || action.includes('REVEAL')) return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
    if (action.includes('FOLDER') || action.includes('FILE')) return <Folder className="w-3.5 h-3.5 text-blue-400" />;
    if (action.includes('VOTE')) return <Vote className="w-3.5 h-3.5 text-amber-400" />;
    return <FileCheck className="w-3.5 h-3.5 text-slate-400" />;
  };

  const handleExportLogs = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aaru_eclipse_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Level 3 Governance Panel */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-[#0d1527] via-[#12153b] to-[#0d1527] p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Vote className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white tracking-wide">
                  Level 3 Preserved Base Governance Voting
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  Backward-Compatible State
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Zero-Knowledge anonymous voting engine preserved from Level 3. Uses nullifiers to prevent double-voting without leaking voter choice.
              </p>
            </div>
          </div>
        </div>

        {/* Voting Progress Bar & Actions */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span className="text-emerald-400 font-bold">YES: {contractState.yesTally} votes ({yesPercent}%)</span>
            </div>
            <span className="text-slate-400">Total Votes: {totalVotes}</span>
            <div className="flex items-center space-x-2">
              <span className="text-rose-400 font-bold">NO: {contractState.noTally} votes ({noPercent}%)</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            </div>
          </div>

          {/* Bar */}
          <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden flex">
            <div
              style={{ width: `${yesPercent}%` }}
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
            />
            <div
              style={{ width: `${noPercent}%` }}
              className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-500"
            />
          </div>

          {/* Cast Vote Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onCastVote('yes')}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Cast ZK Vote YES (Support Proposal)</span>
            </button>

            <button
              onClick={() => onCastVote('no')}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-950/40 flex items-center justify-center space-x-2 active:scale-95 transition-all"
            >
              <Vote className="w-4 h-4" />
              <span>Cast ZK Vote NO (Reject Proposal)</span>
            </button>
          </div>
        </div>
      </div>

      {/* On-Chain Audit Trail Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-cyan-400" />
              <span>On-Chain Cryptographic Audit Trail</span>
              <span className="text-xs font-normal text-slate-400 font-mono">
                ({filteredLogs.length} events)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Immutable chronological record of every contract transition, sealed bid, reveal, and escrow action.
            </p>
          </div>

          <button
            onClick={handleExportLogs}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit JSON</span>
          </button>
        </div>

        {/* Filter Pills and Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
            {[
              { id: 'all', label: 'All Events' },
              { id: 'bids', label: 'Sealed Bids' },
              { id: 'reveal', label: 'ZK Reveals' },
              { id: 'escrow', label: 'Escrow & Refunds' },
              { id: 'folders', label: 'Managed Folders' },
              { id: 'vote', label: 'Governance' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedActionFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedActionFilter === tab.id
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit trail..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Tx Hash</th>
                <th className="py-3 px-4 text-right">Cardano Preprod</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                    No matching audit trail events found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <span className="font-bold text-white uppercase text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {log.action}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-sans text-xs">
                      {log.details}
                    </td>
                    <td className="py-3 px-4 text-cyan-400 font-mono text-[11px]">
                      {log.txHash ? `${log.txHash.substring(0, 16)}...` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href="https://preprod.cardanoscan.io/address/0x71a48c902b8e31a14f52b619d803c4f72831a9f2"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-slate-400 hover:text-cyan-400"
                      >
                        <span className="text-[10px]">Explorer</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
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
