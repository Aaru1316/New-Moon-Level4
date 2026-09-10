import React from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070913]/90 mt-16 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-white">AARU ECLIPSE</span>
          <span>— Level 5 & 6 Multi-Lot ZK Auction Engine</span>
        </div>

        <div className="flex items-center space-x-6">
          <a
            href="https://preprod.cardanoscan.io/address/0x71a48c902b8e31a14f52b619d803c4f72831a9f2"
            target="_blank"
            rel="noreferrer"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <span>Contract Verifier</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://x.com/AaruMidnightZK"
            target="_blank"
            rel="noreferrer"
            className="hover:text-cyan-400 transition-colors"
          >
            @AaruMidnightZK
          </a>
          <span className="text-slate-600">|</span>
          <span className="text-slate-500">Midnight / Cardano Preprod Hackathon</span>
        </div>
      </div>
    </footer>
  );
};
