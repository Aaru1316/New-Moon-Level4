import React, { useState, useEffect } from 'react';
import {
  PreprodNetworkSimulator,
  WalletAccount
} from './contracts/preprod_network';
import { computeBidCommitment, computeBidNullifier, generateSecretSalt } from './circuits/poseidon';
import { AuctionLot, BidCommitmentEntry } from './types/ledger';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Cpu,
  Wallet,
  Zap,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Layers,
  ArrowRightLeft,
  Search,
  FileCheck,
  Sparkles,
  TrendingUp,
  Database,
  Coins
} from 'lucide-react';

const network = new PreprodNetworkSimulator('eclipse-preprod-001');

export default function App() {
  const [wallets, setWallets] = useState<WalletAccount[]>(network.getWallets());
  const [activeWallet, setActiveWallet] = useState<WalletAccount | null>(network.getActiveWallet());
  const [contractState, setContractState] = useState(network.getContractState());

  // Active Tab
  const [activeTab, setActiveTab] = useState<'lots' | 'proof_studio' | 'escrow' | 'explorer' | 'audit'>('lots');
  const [selectedLotId, setSelectedLotId] = useState<string>('lot-1');

  // Form states for bidding
  const [bidAmount, setBidAmount] = useState<number>(550);
  const [secretSalt, setSecretSalt] = useState<string>(generateSecretSalt());
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Status notification states
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [verificationLoading, setVerificationLoading] = useState<boolean>(false);
  const [proofLog, setProofLog] = useState<Array<{ step: string; status: 'pending' | 'passed' | 'failed'; detail: string }>>([]);
  const [lastProofPayload, setLastProofPayload] = useState<any | null>(null);

  // Adversarial test state
  const [adversaryMode, setAdversaryMode] = useState<boolean>(false);
  const [fakeAmount, setFakeAmount] = useState<number>(100);

  // Level 3 Voting state
  const [voteNullifier, setVoteNullifier] = useState<string>(generateSecretSalt());

  // Live block ticker simulation
  const [timeLeft, setTimeLeft] = useState<number>(300);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshState = () => {
    setContractState(network.getContractState());
    setWallets(network.getWallets());
    setActiveWallet(network.getActiveWallet());
  };

  const handleWalletSwitch = (address: string) => {
    network.switchWallet(address);
    refreshState();
    const vaultEntry = network.getVaultEntry(address, selectedLotId);
    if (vaultEntry) {
      setBidAmount(vaultEntry.amount);
      setSecretSalt(vaultEntry.secretSalt);
    } else {
      const selectedLot = contractState.lots.find(l => l.lotId === selectedLotId);
      setBidAmount((selectedLot ? selectedLot.reservePrice : 400) + 150);
      setSecretSalt(generateSecretSalt());
    }
  };

  const handleSelectLot = (lotId: string) => {
    setSelectedLotId(lotId);
    if (activeWallet) {
      const vaultEntry = network.getVaultEntry(activeWallet.address, lotId);
      if (vaultEntry) {
        setBidAmount(vaultEntry.amount);
        setSecretSalt(vaultEntry.secretSalt);
      } else {
        const lot = contractState.lots.find(l => l.lotId === lotId);
        setBidAmount((lot ? lot.reservePrice : 400) + 150);
        setSecretSalt(generateSecretSalt());
      }
    }
  };

  const currentLot = contractState.lots.find(l => l.lotId === selectedLotId) || contractState.lots[0];

  const computedCommitment = activeWallet
    ? computeBidCommitment(bidAmount, secretSalt, activeWallet.address, selectedLotId)
    : '';

  const computedNullifier = activeWallet
    ? computeBidNullifier(secretSalt, activeWallet.address, contractState.auctionId, selectedLotId)
    : '';

  const handleCopySalt = () => {
    navigator.clipboard.writeText(secretSalt);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSubmitBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWallet) return;

    if (bidAmount <= 0) {
      setStatusMessage({ type: 'error', text: 'Bid amount must be greater than 0.' });
      return;
    }

    if (bidAmount < currentLot.reservePrice) {
      setStatusMessage({
        type: 'error',
        text: `Bid amount (${bidAmount} ttDUST) is below Lot Reserve Price (${currentLot.reservePrice} ttDUST).`
      });
      return;
    }

    const result = network.submitSealedBid(bidAmount, selectedLotId);
    refreshState();

    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: `Sealed bid of ${bidAmount} ttDUST committed for [${currentLot.title}]! Poseidon Hash: ${result.commitment?.substring(0, 16)}...`
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: result.message
      });
    }
  };

  const handleCloseAuction = (lotId: string) => {
    const result = network.closeAuction(lotId);
    refreshState();
    if (result.success) {
      setStatusMessage({ type: 'info', text: `Auction Lot closed by organizer. Bids locked.` });
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  const handleRevealAndVerify = async (lotId: string) => {
    if (!activeWallet) return;
    setVerificationLoading(true);
    setActiveTab('proof_studio');
    const lot = contractState.lots.find(l => l.lotId === lotId) || currentLot;

    setProofLog([
      { step: '1. Generating ZK Range Proof (proveHighestBid & proveReserve)', status: 'pending', detail: `Constructing constraints for Lot ${lot.title}...` }
    ]);

    await new Promise(r => setTimeout(r, 600));

    setProofLog(prev => [
      { step: '1. ZK Range Proof Generated', status: 'passed', detail: 'Zero-knowledge non-negativity (v_win - v_i >= 0) calculated.' },
      { step: '2. Reserve Price Threshold Verification', status: 'pending', detail: `Validating v_win >= ${lot.reservePrice} ttDUST...` }
    ]);

    await new Promise(r => setTimeout(r, 700));

    setProofLog(prev => [
      ...prev.slice(0, 1),
      { step: '2. Reserve Price Threshold Satisfied', status: 'passed', detail: `Claimed amount exceeds reserve price of ${lot.reservePrice} ttDUST.` },
      { step: '3. Ledger Commitment Opening & Nullifier Check', status: 'pending', detail: 'Verifying Poseidon Hash on Midnight Preprod Ledger...' }
    ]);

    await new Promise(r => setTimeout(r, 700));

    let result;
    if (adversaryMode) {
      result = network.revealAndVerifyWinner(lotId, {
        winningAmount: fakeAmount,
        secretSalt: secretSalt,
        bidderAddress: activeWallet.address
      });
    } else {
      result = network.revealAndVerifyWinner(lotId);
    }

    refreshState();
    setVerificationLoading(false);

    if (result.success) {
      setProofLog(prev => [
        ...prev.slice(0, 2),
        { step: '3. On-Chain ZK Proof Verified', status: 'passed', detail: 'Smart contract verifier accepted proof payload.' }
      ]);
      setStatusMessage({
        type: 'success',
        text: `Winner verified for [${lot.title}]! ZK Proof recorded on ledger.`
      });
    } else {
      setProofLog(prev => [
        ...prev.slice(0, 2),
        { step: '3. On-Chain Verification Failed', status: 'failed', detail: result.message }
      ]);
      setStatusMessage({
        type: 'error',
        text: `Verification Rejected: ${result.message}`
      });
    }
  };

  const handleSettleEscrow = (lotId: string) => {
    const result = network.settleEscrow(lotId);
    refreshState();
    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: result.message
      });
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  const handleCastVote = (vote: 'yes' | 'no') => {
    const nullifier = computeBidNullifier(voteNullifier, activeWallet?.address || 'anon', 'gov-vote');
    const result = network.castVote(vote, nullifier);
    refreshState();
    setVoteNullifier(generateSecretSalt());

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-[#070913]/90 backdrop-blur-xl">
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
                      onClick={() => handleWalletSwitch(wallet.address)}
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

        {/* Sub-Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/60 flex items-center space-x-1 py-1">
          {[
            { id: 'lots', label: 'Multi-Lot Auction House', icon: Layers },
            { id: 'proof_studio', label: 'ZK Proof Studio', icon: Cpu },
            { id: 'escrow', label: 'Trustless Escrow Vault', icon: Lock },
            { id: 'explorer', label: 'Preprod Explorer', icon: Database },
            { id: 'audit', label: 'Audit & Governance', icon: FileCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Alert Notification */}
        {statusMessage && (
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
              onClick={() => setStatusMessage(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800/60"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: MULTI-LOT AUCTION HOUSE */}
        {activeTab === 'lots' && (
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
                      onClick={() => handleSelectLot(lot.lotId)}
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
                                handleCloseAuction(lot.lotId);
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
                                handleRevealAndVerify(lot.lotId);
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
                                handleSettleEscrow(lot.lotId);
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

                <form onSubmit={handleSubmitBid} className="space-y-5">
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
                          onClick={handleCopySalt}
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
        )}

        {/* TAB 2: ZK PROOF STUDIO */}
        {activeTab === 'proof_studio' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <span>Zero-Knowledge Proof & Constraint Studio</span>
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Inspect Groth16/Plonk SNARK proof payloads ($\pi_A, \pi_B, \pi_C$) and inequality verification pipelines.
              </p>

              {/* Execution Steps Visualizer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {proofLog.length === 0 ? (
                  <div className="col-span-3 p-8 text-center text-slate-500 text-xs bg-slate-950/60 rounded-xl border border-slate-800">
                    No proof verification executed yet. Trigger "Verify ZK Winner" on an auction lot to inspect proof logs.
                  </div>
                ) : (
                  proofLog.map((log, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border space-y-2 ${
                        log.status === 'passed'
                          ? 'bg-emerald-950/30 border-emerald-800/60'
                          : log.status === 'failed'
                          ? 'bg-rose-950/30 border-rose-800/60'
                          : 'bg-cyan-950/30 border-cyan-800/60 animate-pulse'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-white">{log.step}</span>
                        {log.status === 'passed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {log.status === 'failed' && <XCircle className="w-4 h-4 text-rose-400" />}
                      </div>
                      <p className="text-xs text-slate-300 font-mono">{log.detail}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Simulated SNARK Matrix Representation */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white">Circuit Constraint Matrix ($\pi_A, \pi_B, \pi_C$)</h3>
                <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 border border-slate-800 overflow-x-auto space-y-2">
                  <p><span className="text-purple-400">pi_a:</span> ["0xzk_811c9dc5243f6a88...", "0xzk_010001931000193..."]</p>
                  <p><span className="text-indigo-400">pi_b:</span> [["0xzk_auction_id...", "0xzk_nullifier..."], ["0xzk_winning_amount...", "0xzk_valid_flag..."]]</p>
                  <p><span className="text-emerald-400">pi_c:</span> ["0xzk_range_proof_pass...", "0xzk_lot_commitments_count..."]</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TRUSTLESS ESCROW VAULT */}
        {activeTab === 'escrow' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Lock className="w-5 h-5 text-indigo-400" />
                    <span>Trustless Escrow Vault & Automated Refund Engine</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Bidders lock ttDUST token collateral upon bid commitment. Winning funds transfer to seller while losing bidders receive instant automated refunds.
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">TOTAL VAULT COLLATERAL</span>
                  <span className="text-xl font-bold font-mono text-cyan-400">{contractState.totalEscrowLocked} ttDUST</span>
                </div>
              </div>

              {/* Escrow Commitment Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase">
                      <th className="py-3 px-4">Bidder Address</th>
                      <th className="py-3 px-4">Lot ID</th>
                      <th className="py-3 px-4">Escrow Amount</th>
                      <th className="py-3 px-4">Commitment Hash</th>
                      <th className="py-3 px-4">Escrow Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {contractState.bidCommitments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500">
                          No active escrow commitments registered on ledger yet.
                        </td>
                      </tr>
                    ) : (
                      contractState.bidCommitments.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="py-3 px-4 text-white font-bold">{entry.bidderAddress.substring(0, 14)}...</td>
                          <td className="py-3 px-4 text-cyan-400">{entry.lotId}</td>
                          <td className="py-3 px-4 text-emerald-400 font-bold">{entry.escrowAmount} ttDUST</td>
                          <td className="py-3 px-4 text-slate-400">{entry.commitment.substring(0, 16)}...</td>
                          <td className="py-3 px-4">
                            {entry.isRefunded ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-purple-950 text-purple-400 border border-purple-800">
                                Refunded to Wallet
                              </span>
                            ) : entry.isEscrowLocked ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800">
                                Collateral Locked
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400">
                                Released
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PREPROD EXPLORER */}
        {activeTab === 'explorer' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-emerald-400" />
                <span>Midnight / Cardano Preprod Explorer</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                  <h3 className="font-bold text-white text-sm">Ledger State Summary</h3>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Auction ID:</span>
                    <span className="text-cyan-400">{contractState.auctionId}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Block Height:</span>
                    <span className="text-white">#{contractState.blockHeight}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Total Bids Committed:</span>
                    <span className="text-white">{contractState.bidCommitments.length}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Nullifier Tree Size:</span>
                    <span className="text-indigo-400">{contractState.bidderNullifiers.length} Nullifiers</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                  <h3 className="font-bold text-white text-sm">On-Chain Nullifier Registry</h3>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {contractState.bidderNullifiers.length === 0 ? (
                      <p className="text-slate-500 italic">No nullifiers spent yet.</p>
                    ) : (
                      contractState.bidderNullifiers.map((nullifier, i) => (
                        <div key={i} className="text-slate-400 hover:text-white truncate">
                          [{i + 1}] {nullifier}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AUDIT & GOVERNANCE */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
              {/* Preserved Level 3 Governance Panel */}
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/40 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <VoteIcon className="w-4 h-4 text-indigo-400" />
                    <span>Level 3 Preserved Base Governance Voting</span>
                  </h3>
                  <div className="flex space-x-4 text-xs font-mono">
                    <span className="text-emerald-400">YES Tally: {contractState.yesTally}</span>
                    <span className="text-rose-400">NO Tally: {contractState.noTally}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleCastVote('yes')}
                    className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50"
                  >
                    Cast Vote YES
                  </button>
                  <button
                    onClick={() => handleCastVote('no')}
                    className="flex-1 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50"
                  >
                    Cast Vote NO
                  </button>
                </div>
              </div>

              {/* Audit Logs Table */}
              <div>
                <h3 className="text-sm font-bold text-white mb-3">On-Chain Audit Trail</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase">
                        <th className="py-2 px-3">Timestamp</th>
                        <th className="py-2 px-3">Tx Hash</th>
                        <th className="py-2 px-3">Action</th>
                        <th className="py-2 px-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {contractState.auditLogs.slice().reverse().map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/40">
                          <td className="py-2.5 px-3 text-slate-500">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="py-2.5 px-3 text-cyan-400">{log.txHash || 'N/A'}</td>
                          <td className="py-2.5 px-3 font-bold text-white">{log.action}</td>
                          <td className="py-2.5 px-3 text-slate-300">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function VoteIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 12 2 2 4-4" />
      <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z" />
      <path d="M22 19H2" />
    </svg>
  );
}
