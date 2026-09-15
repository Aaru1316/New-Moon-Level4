import React from 'react';
import { ShieldCheck, Clock, Wallet, Coins, ExternalLink, Github } from 'lucide-react';
import { WalletAccount } from '../../contracts/preprod_network';
import { SealedBidAuctionState } from '../../types/ledger';

interface HeaderProps {
  wallets: WalletAccount[];
  activeWallet: WalletAccount | null;
  contractState: SealedBidAuctionState;
  timeLeft: number;
  onWalletSwitch: (address: string) => void;
  onRequestFaucet: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wallets,
  activeWallet,
  contractState,
  timeLeft,
  onWalletSwitch,
  onRequestFaucet
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Brand & Network Badges */}
        <div className="flex items-center space-x-3.5 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center space-x-3">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-300" />
              <div className="relative w-11 h-11 bg-slate-950 rounded-xl flex items-center justify-center border border-cyan-500/30">
                <ShieldCheck className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold tracking-tight text-white">AARU ECLIPSE</span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-700/60">
                  Level 5 & 6 ZK
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700/60">
                  Midnight
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Privacy-Preserving Multi-Lot Sealed-Bid Auction & Trustless Escrow
              </p>
            </div>
          </div>

          {/* Mobile Faucet Button */}
          <button
            onClick={onRequestFaucet}
            className="lg:hidden flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all"
            title="Claim 500 ttDUST testnet tokens"
          >
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>+500 ttDUST</span>
          </button>
        </div>

        {/* Center/Right: Network Ticker, Links & Wallet Switcher */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 w-full lg:w-auto">
          {/* Official Social & Repo Links */}
          <div className="flex items-center space-x-1.5">
            {/* Verified X (Twitter) Profile Link */}
            <a
              href="https://x.com/aaruarya_13"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/90 text-slate-200 border border-slate-700/80 hover:border-cyan-500/60 hover:text-cyan-400 hover:shadow-lg hover:shadow-cyan-950/40 transition-all"
              title="View Author & Project on X (Twitter)"
            >
              {/* Official X Logo SVG */}
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>@aaruarya_13</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            {/* GitHub Repo Link */}
            <a
              href="https://github.com/Aaru1316/New-Moon-Level4"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900/90 text-slate-300 border border-slate-800 hover:border-slate-600 hover:text-white transition-all"
              title="GitHub Source Code"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>

          {/* Testnet Status Ticker */}
          <div className="hidden xl:flex items-center space-x-2 text-xs bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5">
            <div className="flex items-center space-x-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-emerald-400 font-medium">Preprod</span>
            </div>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400 font-mono text-[11px]">#{contractState.blockHeight}</span>
            <span className="text-slate-700">|</span>
            <span className="text-slate-400 flex items-center gap-1 font-mono text-[11px]">
              <Clock className="w-3 h-3 text-cyan-400" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>

          {/* Desktop Faucet Button */}
          <button
            onClick={onRequestFaucet}
            className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-sm"
            title="Claim 500 ttDUST testnet tokens"
          >
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span>Faucet (+500 ttDUST)</span>
          </button>

          {/* Wallet Switcher Pills */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 shadow-inner">
            <div className="flex items-center space-x-1 overflow-x-auto">
              {wallets.map(wallet => {
                const isActive = activeWallet?.address === wallet.address;
                const shortName = wallet.name.split(' ')[0];
                return (
                  <button
                    key={wallet.address}
                    onClick={() => onWalletSwitch(wallet.address)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-950/60 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Wallet className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{shortName}</span>
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-black/25 text-cyan-200' : 'bg-slate-950 text-slate-500'
                    }`}>
                      {wallet.balance}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
