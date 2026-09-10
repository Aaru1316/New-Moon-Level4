import React from 'react';
import { ShieldCheck, Clock, Wallet } from 'lucide-react';
import { WalletAccount } from '../contracts/preprod_network';
import { SealedBidAuctionState } from '../types/ledger';

interface HeaderProps {
  wallets: WalletAccount[];
  activeWallet: WalletAccount | null;
  contractState: SealedBidAuctionState;
  timeLeft: number;
  onWalletSwitch: (address: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  wallets,
  activeWallet,
  contractState,
  timeLeft,
  onWalletSwitch
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-[1px] glow-cyan">
          <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tight text-white">AARU ECLIPSE</span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              Level 5 & 6 ZK
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Sealed-Bid Multi-Lot Auction & Trustless Escrow Engine
          </p>
        </div>
      </div>

      {/* Network Ticker & Wallet Switcher */}
      <div className="flex items-center space-x-4">
        <div className="hidden lg:flex items-center space-x-3 text-xs bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-2">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-emerald-400 font-medium">Midnight Preprod</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 font-mono">Block #{contractState.blockHeight}</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>

        {/* Wallet Selection Dropdown */}
        <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
          <div className="flex items-center space-x-1">
            {wallets.map(wallet => {
              const isActive = activeWallet?.address === wallet.address;
              return (
                <button
                  key={wallet.address}
                  onClick={() => onWalletSwitch(wallet.address)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>{wallet.name.split(' ')[0]}</span>
                    <span className={`font-mono text-[11px] ${isActive ? 'text-cyan-200' : 'text-slate-500'}`}>
                      ({wallet.balance} ttDUST)
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
