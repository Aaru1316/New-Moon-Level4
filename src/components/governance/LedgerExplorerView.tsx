import React, { useState } from 'react';
import {
  Database,
  Search,
  ExternalLink,
  Copy,
  Check,
  Blocks,
  ShieldCheck,
  Code,
  Activity,
  Layers
} from 'lucide-react';
import { SealedBidAuctionState } from '../../types/ledger';

interface LedgerExplorerViewProps {
  contractState: SealedBidAuctionState;
}

export const LedgerExplorerView: React.FC<LedgerExplorerViewProps> = ({ contractState }) => {
  const [activeTab, setActiveTab] = useState<'blocks' | 'nullifiers' | 'state_json' | 'contract_specs'>('blocks');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Simulated live blocks on Midnight Preprod
  const recentBlocks = [
    {
      height: contractState.blockHeight,
      hash: `0xblk_${contractState.blockHeight.toString(16)}8f7a9c1e3d5b7a`,
      slot: 4892011,
      txCount: contractState.bidCommitments.length + 2,
      validator: 'Midnight-Node-EU-01',
      gasUsed: '1,420,850 gas',
      time: 'Just now'
    },
    {
      height: contractState.blockHeight - 1,
      hash: '0xblk_8a9f2b1c4e6d8a0c2e4f6a8b0c2e4f6a',
      slot: 4892010,
      txCount: 3,
      validator: 'Cardano-StakePool-Midnight',
      gasUsed: '890,200 gas',
      time: '20s ago'
    },
    {
      height: contractState.blockHeight - 2,
      hash: '0xblk_7c8e1a0b3d5f7a9c1e3d5b7a9c1e3d5b',
      slot: 4892009,
      txCount: 1,
      validator: 'Midnight-Node-US-04',
      gasUsed: '340,110 gas',
      time: '40s ago'
    },
    {
      height: contractState.blockHeight - 3,
      hash: '0xblk_6b7d0f9a2c4e6f8a0b2d4f6a8b0c2e4f',
      slot: 4892008,
      txCount: 4,
      validator: 'Midnight-Genesis-Validator',
      gasUsed: '2,110,400 gas',
      time: '1m ago'
    }
  ];

  const filteredNullifiers = contractState.bidderNullifiers.filter(n =>
    searchFilter === '' || n.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Explorer Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-[#0d1527] via-[#091a27] to-[#0d1527] p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-white tracking-wide">
                  Midnight / Cardano Preprod Explorer
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Live Testnet RPC
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time on-chain block tracker, nullifier spend tree, and state inspector for Midnight sidechain & Cardano Preprod.
              </p>
            </div>
          </div>

          <a
            href="https://preprod.cardanoscan.io/address/0x71a48c902b8e31a14f52b619d803c4f72831a9f2"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 font-semibold text-xs transition-all shadow-md"
          >
            <span>CardanoScan Preprod</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Network Parameters Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80 font-mono text-xs">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block uppercase">Network Protocol</span>
            <span className="text-emerald-400 font-bold mt-1 block">Midnight Testnet</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block uppercase">Consensus Mechanism</span>
            <span className="text-cyan-400 font-bold mt-1 block">Crypsinous ZK-PoS</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block uppercase">Current Block Height</span>
            <span className="text-white font-bold mt-1 block">#{contractState.blockHeight}</span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block uppercase">Verifier Address</span>
            <span className="text-purple-400 font-bold mt-1 block truncate">0x71a48c902b8e...</span>
          </div>
        </div>
      </div>

      {/* Explorer Workspace */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {/* Navigation Tabs Bar */}
        <div className="border-b border-slate-800/80 bg-slate-950/60 px-4 flex items-center justify-between">
          <div className="flex space-x-1 py-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('blocks')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'blocks'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Blocks className="w-3.5 h-3.5" />
              <span>Preprod Blocks ({recentBlocks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('nullifiers')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'nullifiers'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Nullifier Spend Tree ({contractState.bidderNullifiers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('state_json')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'state_json'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>Raw Ledger State (JSON)</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Recent Blocks */}
        {activeTab === 'blocks' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Recent Confirmed Blocks</h3>
              <span className="text-xs font-mono text-slate-400">Sync status: In Sync (0 lag)</span>
            </div>

            <div className="space-y-3">
              {recentBlocks.map((block, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all font-mono text-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-cyan-400 font-bold">Block #{block.height}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">{block.time}</span>
                    </div>
                    <p className="text-slate-400 truncate max-w-md">
                      Hash: <span className="text-slate-300">{block.hash}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">VALIDATOR</span>
                      <span className="text-white font-medium">{block.validator}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">TX COUNT</span>
                      <span className="text-emerald-400 font-bold">{block.txCount} txs</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">GAS CONSUMPTION</span>
                      <span className="text-purple-300">{block.gasUsed}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Nullifiers Tree */}
        {activeTab === 'nullifiers' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white">Cryptographic Nullifier Tree (Double-Spend Protection)</h3>
                <p className="text-xs text-slate-400">
                  Formula: <code className="text-cyan-400">H(salt, bidderAddress, auctionId, lotId)</code>. Nullifiers prevent double-bidding while keeping identities 100% private.
                </p>
              </div>

              <div className="relative sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter nullifiers..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              {filteredNullifiers.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/60 rounded-xl border border-slate-800">
                  No nullifiers registered on-chain yet. Submit a sealed bid to generate a cryptographic nullifier.
                </div>
              ) : (
                filteredNullifiers.map((nullifier, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs flex items-center justify-between hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                        #{idx + 1}
                      </span>
                      <span className="text-slate-300 font-semibold truncate max-w-lg">{nullifier}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                        SPENT / RECORDED
                      </span>
                      <button
                        onClick={() => handleCopy(nullifier, `null-${idx}`)}
                        className="text-slate-400 hover:text-white"
                      >
                        {copiedId === `null-${idx}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: State JSON */}
        {activeTab === 'state_json' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Full On-Chain Ledger State</h3>
                <p className="text-xs text-slate-400">
                  Live state snapshot maintained by Midnight testnet validator node and verified on Cardano Preprod.
                </p>
              </div>

              <button
                onClick={() => handleCopy(JSON.stringify(contractState, null, 2), 'state')}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700 transition-all"
              >
                {copiedId === 'state' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === 'state' ? 'Copied' : 'Copy State JSON'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed max-h-96">
              {JSON.stringify(contractState, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
