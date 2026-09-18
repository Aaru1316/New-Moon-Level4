import React from 'react';
import { X, CheckCircle2, ExternalLink, Github, ShieldCheck, Sparkles, Copy, Check } from 'lucide-react';

interface XProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const XProfileModal: React.FC<XProfileModalProps> = ({ isOpen, onClose }) => {
  const [copiedContract, setCopiedContract] = React.useState(false);

  if (!isOpen) return null;

  const contractAddress = '0x71a48c902b8e31a14f52b619d803c4f72831a9f2';

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0B0F19] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/60 overflow-hidden">
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-full transition-all border border-slate-700/60"
          title="Close profile"
        >
          <X className="w-5 h-5" />
        </button>

        {/* X Profile Header Banner */}
        <div className="relative h-44 sm:h-52 w-full bg-slate-900 overflow-hidden">
          <img
            src="/x_profile_banner.jpg"
            alt="Aaru Eclipse Official X Profile Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-black/30" />
          
          <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-cyan-500/40">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold text-cyan-300 tracking-wide uppercase">Official X Profile</span>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar & Action Button Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-16 sm:-mt-20 mb-4 gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
              <img
                src="/logo.jpg"
                alt="@aaruarya_13 Avatar"
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-[#0B0F19] shadow-xl bg-slate-950"
              />
            </div>

            <div className="flex items-center space-x-2.5 w-full sm:w-auto">
              <a
                href="https://x.com/aaruarya_13"
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-950/60 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Follow @aaruarya_13 on X</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <a
                href="https://github.com/Aaru1316/New-Moon-Level4"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all"
                title="View GitHub Repository"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* User Name & Handle */}
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Aaru Eclipse 🌙</h2>
              <span title="Verified Protocol Developer">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-md">
                Verified X Profile
              </span>
            </div>
            <p className="text-sm font-medium text-slate-400 mt-0.5 font-mono">@aaruarya_13</p>
          </div>

          {/* Bio */}
          <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
            Privacy-Preserving Multi-Lot ZK Sealed-Bid Auction & Trustless Escrow Engine on{' '}
            <span className="text-cyan-400 font-semibold">@MidnightNtwrk</span> &{' '}
            <span className="text-indigo-400 font-semibold">@Cardano</span>. Featuring Zero-Knowledge Range Proofs, Poseidon commitments, <code className="text-emerald-400 bg-emerald-950/60 px-1 py-0.5 rounded">ttDUST</code> escrow vaults, and automated losing bidder refunds.
          </p>

          {/* Protocol Tags / Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Midnight ZK Privacy
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Cardano Preprod Testnet
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
              Level 5 & 6 Compact Circuits
            </span>
            <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ttDUST Trustless Escrow
            </span>
          </div>

          {/* Pinned Tweet Showcase Box */}
          <div className="mt-5 p-4 rounded-xl bg-slate-900/90 border border-slate-800 relative group hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>PINNED POST ON X</span>
              </div>
              <span className="text-[11px] text-slate-500">Sept 2026</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              🚀 Excited to deploy <strong className="text-white">Aaru Eclipse (Level 5 & 6)</strong>! Private multi-lot bidding, zero-knowledge range proofs for 2nd-price settlement, and automated escrow refund engine live on Cardano Preprod & Midnight testnet! Check it out below 👇
            </p>

            {/* Smart Contract Explorer Address Tag */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-2 text-slate-400 overflow-hidden">
                <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span className="truncate text-[11px]">Verifier: {contractAddress}</span>
              </div>
              <button
                onClick={handleCopyContract}
                className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded bg-cyan-950/60 border border-cyan-800/60 transition-all flex-shrink-0"
                title="Copy verifier contract address"
              >
                {copiedContract ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span className="text-[10px]">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Links Bar */}
          <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs">
            <span className="text-slate-500 font-medium">Verified Official Author Profile</span>
            <a
              href="https://preprod.cardanoscan.io/address/0x71a48c902b8e31a14f52b619d803c4f72831a9f2"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
            >
              <span>View Cardanoscan Explorer</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
