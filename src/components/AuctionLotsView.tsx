import React from 'react';
import {
  Coins,
  Lock,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Trophy,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react';
import { SealedBidAuctionState, AuctionLot } from '../types/ledger';
import { generateSecretSalt } from '../circuits/poseidon';

interface AuctionLotsViewProps {
  contractState: SealedBidAuctionState;
  selectedLotId: string;
  currentLot: AuctionLot;
  bidAmount: number;
  setBidAmount: (amount: number) => void;
  secretSalt: string;
  setSecretSalt: (salt: string) => void;
  copySuccess: boolean;
  computedCommitment: string;
  computedNullifier: string;
  adversaryMode: boolean;
  setAdversaryMode: (val: boolean) => void;
  fakeAmount: number;
  setFakeAmount: (val: number) => void;
  onSelectLot: (lotId: string) => void;
  onCopySalt: () => void;
  onSubmitBid: (e: React.FormEvent) => void;
  onCloseAuction: (lotId: string) => void;
  onRevealAndVerify: (lotId: string) => void;
  onSettleEscrow: (lotId: string) => void;
}

export const AuctionLotsView: React.FC<AuctionLotsViewProps> = ({
  contractState,
  selectedLotId,
  currentLot,
  bidAmount,
  setBidAmount,
  secretSalt,
  setSecretSalt,
  copySuccess,
  computedCommitment,
  computedNullifier,
  adversaryMode,
  setAdversaryMode,
  fakeAmount,
  setFakeAmount,
  onSelectLot,
  onCopySalt,
  onSubmitBid,
  onCloseAuction,
  onRevealAndVerify,
  onSettleEscrow
}) => {
  return (
    <div className="space-y-8">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Total Escrow Collateral</p>
            <p className="text-2xl font-bold text-white mt-1 font-mono">{contractState.totalEscrowLocked} ttDUST</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Active Bids Committed</p>
            <p className="text-2xl font-bold text-white mt-1 font-mono">{contractState.bidCommitments.length}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Verifier Address</p>
            <p className="text-xs font-bold text-cyan-400 mt-2 font-mono truncate max-w-[140px]">
              0x71a48c902b8e3...
            </p>
          </div>
          <a
            href="https://preprod.cardanoscan.io/address/0x71a48c902b8e31a14f52b619d803c4f72831a9f2"
            target="_blank"
            rel="noreferrer"
            className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-cyan-400"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Privacy Circuit</p>
            <p className="text-xs font-bold text-emerald-400 mt-2 font-mono">
              Poseidon + SNARK
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Auction Lots Display Grid */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>Active Multi-Lot Sealed-Bid Items</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contractState.lots.map(lot => {
            const isSelected = selectedLotId === lot.lotId;
            const lotCommitmentsCount = contractState.bidCommitments.filter(b => b.lotId === lot.lotId).length;

            return (
              <div
                key={lot.lotId}
                onClick={() => onSelectLot(lot.lotId)}
                className={`glass-card rounded-2xl overflow-hidden border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500 shadow-xl shadow-cyan-950/30 ring-1 ring-cyan-500/50'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="relative h-44 overflow-hidden bg-slate-950">
                  <img
                    src={lot.imageUrl}
                    alt={lot.title}
                    className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-md bg-slate-900/90 text-cyan-400 border border-cyan-800/50 backdrop-blur-md">
                      {lot.category}
                    </span>
                    <span className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-md bg-indigo-950/90 text-indigo-300 border border-indigo-800/50 backdrop-blur-md">
                      {lot.auctionType === 'vickrey' ? 'Vickrey (2nd Price)' : 'First-Price'}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase backdrop-blur-md ${
                        lot.status === 'active'
                          ? 'bg-emerald-950/90 text-emerald-400 border-emerald-800/80'
                          : lot.status === 'closed'
                          ? 'bg-amber-950/90 text-amber-400 border-amber-800/80'
                          : lot.status === 'verified'
                          ? 'bg-cyan-950/90 text-cyan-400 border-cyan-800/80'
                          : 'bg-purple-950/90 text-purple-400 border-purple-800/80'
                      }`}
                    >
                      {lot.status}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white">{lot.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{lot.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/60 font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px]">RESERVE PRICE</span>
                      <span className="text-cyan-400 font-bold">{lot.reservePrice} ttDUST</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">SEALED BIDS</span>
                      <span className="text-slate-200 font-bold">{lotCommitmentsCount} Bids</span>
                    </div>
                  </div>

                  {/* Verified Winner Display */}
                  {lot.status === 'verified' && (
                    <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/50 space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs text-cyan-400 font-semibold">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span>Verified ZK Winner</span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono truncate">
                        Bidder: {lot.winningBidder?.substring(0, 14)}...
                      </p>
                      <p className="text-xs text-emerald-400 font-mono font-bold">
                        Winning Price: {lot.auctionType === 'vickrey' ? lot.secondHighestAmount : lot.winningAmount} ttDUST
                      </p>
                    </div>
                  )}

                  {/* Action buttons for lot */}
                  <div className="pt-2 flex items-center space-x-2">
                    {lot.status === 'active' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCloseAuction(lot.lotId);
                        }}
                        className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-900/50 flex items-center justify-center space-x-1.5"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Close Lot</span>
                      </button>
                    )}

                    {lot.status === 'closed' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRevealAndVerify(lot.lotId);
                        }}
                        className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/50 flex items-center justify-center space-x-1.5"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify ZK Winner</span>
                      </button>
                    )}

                    {lot.status === 'verified' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSettleEscrow(lot.lotId);
                        }}
                        className="w-full py-2 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Settle Escrow</span>
                      </button>
                    )}

                    {lot.status === 'settled' && (
                      <div className="w-full py-2 text-center text-xs text-purple-400 font-semibold bg-purple-950/30 border border-purple-800/40 rounded-lg">
                        Escrow Settled & Refunded
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bidding Control Panel & Adversarial Test Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        {/* Left Column: Submit Sealed Bid Form */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                <span>Commit Sealed Bid for [{currentLot.title}]</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Your bid amount is protected on-chain as a Poseidon hash commitment H(amount, salt, address, lotId).
              </p>
            </div>

            <span className="px-3 py-1 text-xs font-mono rounded-lg bg-slate-900 text-cyan-400 border border-slate-800">
              Reserve: {currentLot.reservePrice} ttDUST
            </span>
          </div>

          <form onSubmit={onSubmitBid} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Bid Amount (ttDUST)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    disabled={currentLot.status !== 'active'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-500 disabled:opacity-50"
                  />
                  <span className="absolute right-3 top-3 text-xs text-slate-500 font-mono">ttDUST</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                  <span>Secret Salt (Private Input)</span>
                  <button
                    type="button"
                    onClick={() => setSecretSalt(generateSecretSalt())}
                    className="text-cyan-400 text-[11px] hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={secretSalt}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-300 font-mono pr-10 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={onCopySalt}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white p-1 rounded"
                  >
                    {copySuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Calculated Hashes Live Preview */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Poseidon Commitment Hash:</span>
                <span className="text-cyan-400 font-mono font-bold truncate max-w-[280px]">
                  {computedCommitment || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Bidder ZK Nullifier:</span>
                <span className="text-indigo-400 font-mono font-bold truncate max-w-[280px]">
                  {computedNullifier || 'N/A'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={currentLot.status !== 'active'}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-cyan-950/50 hover:opacity-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Lock className="w-4 h-4" />
              <span>Commit Sealed Bid On-Chain (Lock {bidAmount} ttDUST Escrow)</span>
            </button>
          </form>
        </div>

        {/* Right Column: Adversarial Test & Security Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-800/80 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Adversarial Fraud Tester</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Demonstrate Zero-Knowledge fraud proof rejection by attempting to reveal a fake bid or invalid salt.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-semibold text-slate-300">Enable Adversarial Fraud Mode</span>
              <button
                type="button"
                onClick={() => setAdversaryMode(!adversaryMode)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                  adversaryMode ? 'bg-rose-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    adversaryMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {adversaryMode && (
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 space-y-3">
                <label className="block text-xs font-medium text-rose-300">
                  Fake Manipulated Bid Claim (ttDUST)
                </label>
                <input
                  type="number"
                  value={fakeAmount}
                  onChange={(e) => setFakeAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-rose-900/60 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
                <p className="text-[11px] text-rose-400">
                  ⚠️ Zero-knowledge range proof constraints will fail commitment opening and reject verification!
                </p>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
              <p className="font-semibold text-slate-200">Security Guarantees:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>Losing bid amounts are never stored or exposed on-chain.</li>
                <li>Double bidding is rejected by derived Poseidon nullifiers.</li>
                <li>Smart contract verifier enforces ZK range proof (v_win &gt;= v_i).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
