import React from 'react';
import { Layers, Folder, Cpu, Lock, Database, FileCheck, Sparkles } from 'lucide-react';
import { SealedBidAuctionState } from '../../types/ledger';

export type TabType = 'lots' | 'managed_folders' | 'proof_studio' | 'escrow' | 'explorer' | 'audit';

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
    {
      id: 'lots' as TabType,
      label: 'Multi-Lot Auction House',
      icon: Layers,
      badge: `${contractState.lots.length} Lots`,
      badgeColor: 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/60'
    },
    {
      id: 'managed_folders' as TabType,
      label: 'Managed Folders',
      icon: Folder,
      badge: `${contractState.managedFolders?.length || 0} Vaults`,
      badgeColor: 'bg-purple-950/80 text-purple-300 border border-purple-800/60',
      isNew: true
    },
    {
      id: 'proof_studio' as TabType,
      label: 'ZK Proof Studio',
      icon: Cpu,
      badge: 'Groth16/Plonk',
      badgeColor: 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
    },
    {
      id: 'escrow' as TabType,
      label: 'Trustless Escrow Vault',
      icon: Lock,
      badge: `${contractState.totalEscrowLocked} ttDUST`,
      badgeColor: 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
    },
    {
      id: 'explorer' as TabType,
      label: 'Preprod Explorer',
      icon: Database,
      badge: `#${contractState.blockHeight}`,
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700'
    },
    {
      id: 'audit' as TabType,
      label: 'Audit & Governance',
      icon: FileCheck,
      badge: `${contractState.auditLogs.length} Events`,
      badgeColor: 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
    }
  ];

  return (
    <div className="border-t border-slate-800/60 bg-[#070913]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1.5 py-2 overflow-x-auto no-scrollbar scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all duration-200 group ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500/15 via-indigo-500/15 to-purple-500/15 text-white border border-cyan-500/40 shadow-lg shadow-cyan-950/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                }`} />
                <span>{tab.label}</span>

                {/* Badge indicator */}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium ${tab.badgeColor}`}>
                  {tab.badge}
                </span>

                {/* Highlight dot if active */}
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
