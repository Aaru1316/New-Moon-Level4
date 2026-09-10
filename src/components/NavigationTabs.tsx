import React from 'react';
import { Layers, Cpu, Lock, Database, FileCheck } from 'lucide-react';
import { SealedBidAuctionState } from '../types/ledger';

export type TabType = 'lots' | 'proof_studio' | 'escrow' | 'explorer' | 'audit';

interface NavigationTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  contractState: SealedBidAuctionState;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  setActiveTab,
  contractState
}) => {
  const tabs = [
    { id: 'lots' as TabType, label: 'Multi-Lot Auction House', icon: Layers },
    { id: 'proof_studio' as TabType, label: 'ZK Proof Studio', icon: Cpu },
    { id: 'escrow' as TabType, label: 'Trustless Escrow Vault', icon: Lock },
    { id: 'explorer' as TabType, label: 'Preprod Explorer', icon: Database },
    { id: 'audit' as TabType, label: 'Audit & Governance', icon: FileCheck }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60 flex items-center space-x-1 py-1">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              active
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {tab.id === 'lots' && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 text-[10px]">
                {contractState.lots.length}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
