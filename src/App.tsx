import React, { useState, useEffect } from 'react';
import {
  PreprodNetworkSimulator,
  WalletAccount
} from './contracts/preprod_network';
import { computeBidCommitment, computeBidNullifier, generateSecretSalt } from './circuits/poseidon';
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
  Check
} from 'lucide-react';

const network = new PreprodNetworkSimulator('auction-preprod-001');

export default function App() {
  const [wallets, setWallets] = useState<WalletAccount[]>(network.getWallets());
  const [activeWallet, setActiveWallet] = useState<WalletAccount | null>(network.getActiveWallet());
  const [contractState, setContractState] = useState(network.getContractState());

  // Form states for bidding
  const [bidAmount, setBidAmount] = useState<number>(500);
  const [secretSalt, setSecretSalt] = useState<string>(generateSecretSalt());
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Status notification states
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [verificationLoading, setVerificationLoading] = useState<boolean>(false);
  const [proofLog, setProofLog] = useState<Array<{ step: string; status: 'pending' | 'passed' | 'failed'; detail: string }>>([]);

  // Adversarial test state
  const [adversaryMode, setAdversaryMode] = useState<boolean>(false);
  const [fakeAmount, setFakeAmount] = useState<number>(100);

  // Countdown timer simulation
  const [timeLeft, setTimeLeft] = useState<number>(180); // 3 minutes countdown

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
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
    // Pre-fill existing vault salt if present
    const vaultEntry = network.getVaultEntry(address);
    if (vaultEntry) {
      setBidAmount(vaultEntry.amount);
      setSecretSalt(vaultEntry.secretSalt);
    } else {
      setSecretSalt(generateSecretSalt());
    }
  };

  const computedCommitment = activeWallet
    ? computeBidCommitment(bidAmount, secretSalt, activeWallet.address)
    : '';

  const computedNullifier = activeWallet
    ? computeBidNullifier(secretSalt, activeWallet.address, contractState.auctionId)
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

    const result = network.submitSealedBid(bidAmount);
    refreshState();

    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: `Sealed bid of ${bidAmount} ttDUST committed! Poseidon Hash: ${result.commitment?.substring(0, 16)}...`
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: result.message
      });
    }
  };

  const handleCloseAuction = () => {
    const result = network.closeAuction();
    refreshState();
    if (result.success) {
      setStatusMessage({ type: 'info', text: 'Auction closed by organizer. Bids locked.' });
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  const handleRevealAndVerify = async () => {
    if (!activeWallet) return;
    setVerificationLoading(true);
    setProofLog([
      { step: '1. Generating ZK Range Proof (proveHighestBid)', status: 'pending', detail: 'Constructing Groth16/Plonk circuit constraints...' }
    ]);

    await new Promise(r => setTimeout(r, 600));

    setProofLog(prev => [
      { step: '1. ZK Range Proof Generated', status: 'passed', detail: 'Zero-knowledge non-negativity constraints calculated.' },
      { step: '2. Ledger Commitment Opening Check', status: 'pending', detail: 'Verifying H(winningAmount, secretSalt, address) matches ledger commitment...' }
    ]);

    await new Promise(r => setTimeout(r, 700));

    // Execute contract verification
    let result;
    if (adversaryMode) {
      // Intentionally supply manipulated amount to demonstrate rejection!
      result = network.revealAndVerifyWinner({
        winningAmount: fakeAmount,
        secretSalt: secretSalt,
        bidderAddress: activeWallet.address
      });
    } else {
      result = network.revealAndVerifyWinner();
    }

    refreshState();
    setVerificationLoading(false);

    if (result.success) {
      setProofLog(prev => [
        prev[0],
        { step: '2. Commitment Opening Check', status: 'passed', detail: 'Opening hash matches registered on-chain commitment.' },
        { step: '3. Range Proof Verification (Maximal Bid Check)', status: 'passed', detail: 'Proved: winningAmount >= all hidden bids (losing amounts remain zero-knowledge).' },
        { step: '4. On-Chain Ledger Verification Complete', status: 'passed', detail: 'Winner state finalized on Midnight Preprod contract.' }
      ]);
      setStatusMessage({ type: 'success', text: result.message });
    } else {
      setProofLog(prev => [
        prev[0],
        { step: '2. Verification Failed', status: 'failed', detail: result.message },
        { step: '3. Claim Rejected On-Chain', status: 'failed', detail: 'Circuit verifier rejected invalid winner claim.' }
      ]);
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* 1. Header Navigation */}
      <header className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-cyan-500/20 glow-cyan">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Aaru New Moon Level 4
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                Waxing Gibbous MVP
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Sealed-Bid Auction with Verifiable Winner (Private Bids + Public Proof of Fairness)
            </p>
          </div>
        </div>

        {/* Network & Wallet Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">Midnight Preprod Testnet</span>
          </div>

          <div className="relative flex items-center gap-2 bg-slate-900/90 border border-slate-700/60 rounded-xl px-3 py-1.5">
            <Wallet className="w-4 h-4 text-cyan-400" />
            <select
              value={activeWallet?.address}
              onChange={e => handleWalletSwitch(e.target.value)}
              className="bg-transparent text-xs font-mono font-semibold text-slate-200 outline-none cursor-pointer pr-2"
            >
              {wallets.map(w => (
                <option key={w.address} value={w.address} className="bg-slate-900 text-slate-200">
                  {w.name} ({w.balance} ttDUST)
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between gap-3 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              : 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {statusMessage.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {statusMessage.type === 'info' && <Zap className="w-5 h-5 text-cyan-400 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-200 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Top Status Bar & Auction Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Auction Countdown</span>
            <span className="font-mono text-lg font-bold text-slate-100">
              {contractState.auctionOpen ? formatTime(timeLeft) : '00:00 (LOCKED)'}
            </span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl flex items-center gap-3">
          <div className={`p-2.5 rounded-lg border ${contractState.auctionOpen ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
            {contractState.auctionOpen ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Auction Lifecycle</span>
            <span className={`font-semibold text-sm ${contractState.auctionOpen ? 'text-emerald-400' : 'text-amber-400'}`}>
              {contractState.auctionOpen ? 'AUCTION OPEN (Accepting Bids)' : 'AUCTION LOCKED (Verification Mode)'}
            </span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">On-Chain Commitments</span>
            <span className="font-mono text-lg font-bold text-purple-300">
              {contractState.bidCommitments.length} Sealed Bids
            </span>
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl flex items-center gap-3">
          <div className={`p-2.5 rounded-lg border ${contractState.isVerified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Verified Winner</span>
            <span className="font-semibold text-sm text-slate-200">
              {contractState.isVerified && contractState.winningAmount
                ? `${contractState.winningAmount} ttDUST (ZK Proven)`
                : 'Pending Reveal'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main 3-Column Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Submit Sealed Bid Form */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              <h2 className="font-bold text-lg text-slate-100">1. Submit Sealed Bid</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Zero-Knowledge</span>
          </div>

          <form onSubmit={handleSubmitBid} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Active Bidder Account</label>
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-300 font-semibold">{activeWallet?.name}</span>
                <span className="text-slate-400">{formatAddress(activeWallet?.address || '')}</span>
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Bid Amount (ttDUST)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max={activeWallet?.balance}
                  value={bidAmount}
                  onChange={e => setBidAmount(Number(e.target.value))}
                  disabled={!contractState.auctionOpen}
                  className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl px-4 py-2.5 text-slate-100 font-mono font-bold outline-none focus:border-cyan-500 disabled:opacity-50"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono font-semibold">
                  ttDUST
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-slate-400">Secret Salt (Private Input)</label>
                <button
                  type="button"
                  onClick={() => setSecretSalt(generateSecretSalt())}
                  disabled={!contractState.auctionOpen}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Regenerate
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={secretSalt}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-10 text-xs font-mono text-slate-300 outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopySalt}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
                  title="Copy Salt"
                >
                  {copySuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Cryptographic Preview Box */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 flex flex-col gap-2">
              <span className="text-[11px] text-slate-400 font-medium">On-Chain Commitment Preview</span>
              <div className="text-[11px] font-mono text-purple-300 break-all bg-slate-900/60 p-2 rounded-lg border border-purple-500/20">
                Commitment: {computedCommitment}
              </div>
              <div className="text-[11px] font-mono text-slate-400 break-all bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                Nullifier: {computedNullifier.substring(0, 24)}...
              </div>
              <p className="text-[10px] text-slate-500 italic mt-0.5">
                * Note: Your bid amount ({bidAmount}) is never exposed on-chain. Only the Poseidon Commitment hash is recorded.
              </p>
            </div>

            <button
              type="submit"
              disabled={!contractState.auctionOpen}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-teal-500 text-black hover:from-cyan-400 hover:to-teal-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
            >
              {contractState.auctionOpen ? 'Commit Hidden Bid On-Chain' : 'Auction Closed'}
            </button>
          </form>
        </div>

        {/* Column 2: On-Chain Ledger & Auction State */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              <h2 className="font-bold text-lg text-slate-100">2. On-Chain Ledger State</h2>
            </div>
            <button
              onClick={handleCloseAuction}
              disabled={!contractState.auctionOpen}
              className="px-3 py-1 text-xs rounded-lg font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 disabled:opacity-40"
            >
              Close Auction
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Submitted Sealed Commitments ({contractState.bidCommitments.length})</span>
              <span className="text-emerald-400 font-mono">Ledger Privacy Active</span>
            </div>

            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
              {contractState.bidCommitments.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-900/50 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                  No sealed bid commitments submitted yet.
                </div>
              ) : (
                contractState.bidCommitments.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-purple-300 font-medium">
                        Commitment #{idx + 1}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-300 break-all bg-slate-950 p-2 rounded-lg">
                      {entry.commitment}
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">Nullifier Spent: {entry.nullifier.substring(0, 16)}...</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <EyeOff className="w-3 h-3" /> Amount Hidden
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Level 3 Voting State Baseline Check */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs flex flex-col gap-1 mt-2">
              <span className="text-slate-400 font-medium">Level 3 Voting State (Preserved Baseline)</span>
              <div className="flex justify-between text-slate-300 font-mono text-[11px] mt-1">
                <span>Yes Tally: {contractState.yesTally}</span>
                <span>No Tally: {contractState.noTally}</span>
                <span>Nullifiers Spent: {contractState.nullifierSet.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Winner Reveal & ZK Verification Studio */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col gap-5 border border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-lg text-slate-100">3. Winner ZK Verification</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">proveHighestBid</span>
          </div>

          <div className="flex flex-col gap-4">
            {/* Adversary Testing Toggle */}
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" /> Adversary Simulation Test
                </span>
                <input
                  type="checkbox"
                  checked={adversaryMode}
                  onChange={e => setAdversaryMode(e.target.checked)}
                  className="accent-amber-400 cursor-pointer"
                />
              </div>
              {adversaryMode && (
                <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                  <span>Claim Fake Lower Bid Amount:</span>
                  <input
                    type="number"
                    value={fakeAmount}
                    onChange={e => setFakeAmount(Number(e.target.value))}
                    className="w-20 bg-slate-900 border border-amber-500/50 rounded px-2 py-1 text-amber-300 font-mono"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleRevealAndVerify}
              disabled={contractState.auctionOpen || verificationLoading || contractState.bidCommitments.length === 0}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              {verificationLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Verifying ZK Proof...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Reveal & Verify Winner On-Chain
                </>
              )}
            </button>

            {/* ZK Proof Log Step Breakdown */}
            {proofLog.length > 0 && (
              <div className="flex flex-col gap-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 mb-1">ZK Proof Step Verification:</span>
                {proofLog.map((log, i) => (
                  <div key={i} className="flex flex-col gap-1 text-xs border-b border-slate-900 last:border-0 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-slate-200">{log.step}</span>
                      {log.status === 'passed' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      {log.status === 'failed' && <XCircle className="w-4 h-4 text-rose-400" />}
                      {log.status === 'pending' && <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />}
                    </div>
                    <p className="text-[11px] text-slate-400">{log.detail}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Winner Trophy Card */}
            {contractState.isVerified && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 glow-emerald flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Trophy className="w-5 h-5" /> Verifiable Winner Confirmed!
                </div>
                <div className="text-xs font-mono text-slate-300">
                  Winning Bid: <span className="text-emerald-300 font-bold">{contractState.winningAmount} ttDUST</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 break-all">
                  Winner Address: {contractState.winningBidder}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>ZK Verification: PASSED</span>
                  <span className="text-emerald-400 font-semibold">Losing Bids: PRIVACY KEPT</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. On-Chain Ledger Audit Log */}
      <footer className="glass-panel p-5 rounded-2xl flex flex-col gap-3 border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
          <span className="font-semibold text-slate-200">Midnight Ledger Audit Event Log</span>
          <span>Contract Address: 0x71a48c902b8e31a14f52b619d803c4f72831a9f2</span>
        </div>
        <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto font-mono text-xs text-slate-300">
          {contractState.auditLogs.map((log, index) => (
            <div key={index} className="flex items-center justify-between bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-900">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-semibold">[{log.action}]</span>
                <span>{log.details}</span>
              </div>
              <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
