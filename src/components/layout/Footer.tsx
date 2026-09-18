import React from 'react';
import { ShieldCheck, ExternalLink, Github, Heart } from 'lucide-react';

interface FooterProps {
  onOpenXProfile?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenXProfile }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070913]/95 mt-20 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand & Mission */}
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 text-center sm:text-left cursor-pointer" onClick={onOpenXProfile}>
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-500/40 p-0.5 bg-slate-950 flex-shrink-0">
              <img src="/logo.jpg" alt="Aaru Eclipse Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="font-black text-white tracking-wide">AARU ECLIPSE</span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs text-cyan-400 font-bold">Level 5 & 6 Sealed-Bid ZK Engine</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Privacy-Preserving Multi-Lot Auctions, Managed Storage & Trustless Escrow on Midnight / Cardano
              </p>
            </div>
          </div>

          {/* Social & Verification Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            {/* Verified X (Twitter) Profile Trigger */}
            <button
              onClick={onOpenXProfile}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 hover:text-white hover:shadow-lg hover:shadow-cyan-950/40 transition-all font-semibold"
            >
              <svg className="w-3.5 h-3.5 fill-cyan-400" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>@aaruarya_13 on X</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </button>

            {/* GitHub Repository */}
            <a
              href="https://github.com/Aaru1316/New-Moon-Level4"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-600 hover:text-white transition-all font-medium"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repo</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            {/* Smart Contract Verifier */}
            <a
              href="https://preprod.cardanoscan.io/address/0x71a48c902b8e31a14f52b619d803c4f72831a9f2"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400 transition-all font-mono"
            >
              <span>Preprod Verifier: 0x71a48c...</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© 2026 Aaru Eclipse. Built for the Midnight / Cardano Privacy Hackathon.</p>
          <div className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>by</span>
            <a
              href="https://x.com/aaruarya_13"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline font-semibold"
            >
              @aaruarya_13
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
