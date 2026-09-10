import React from 'react';
import { CheckCircle2, XCircle, Zap } from 'lucide-react';
import { StatusMessage } from '../hooks/useAuctionNetwork';

interface StatusBannerProps {
  statusMessage: StatusMessage | null;
  onDismiss: () => void;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ statusMessage, onDismiss }) => {
  if (!statusMessage) return null;

  return (
    <div
      className={`mb-6 p-4 rounded-xl border flex items-center justify-between text-sm shadow-xl backdrop-blur-lg ${
        statusMessage.type === 'success'
          ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-200'
          : statusMessage.type === 'error'
          ? 'bg-rose-950/60 border-rose-800/80 text-rose-200'
          : 'bg-cyan-950/60 border-cyan-800/80 text-cyan-200'
      }`}
    >
      <div className="flex items-center space-x-3">
        {statusMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
        {statusMessage.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
        {statusMessage.type === 'info' && <Zap className="w-5 h-5 text-cyan-400 shrink-0" />}
        <span>{statusMessage.text}</span>
      </div>
      <button
        onClick={onDismiss}
        className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/60"
      >
        Dismiss
      </button>
    </div>
  );
};
