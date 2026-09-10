import { useState, useEffect } from 'react';
import { PreprodNetworkSimulator, WalletAccount } from '../contracts/preprod_network';
import { computeBidCommitment, computeBidNullifier, generateSecretSalt } from '../circuits/poseidon';
import { SealedBidAuctionState } from '../types/ledger';

const network = new PreprodNetworkSimulator('eclipse-preprod-001');

export interface StatusMessage {
  type: 'success' | 'error' | 'info';
  text: string;
}

export interface ProofLogEntry {
  step: string;
  status: 'pending' | 'passed' | 'failed';
  detail: string;
}

export function useAuctionNetwork() {
  const [wallets, setWallets] = useState<WalletAccount[]>(network.getWallets());
  const [activeWallet, setActiveWallet] = useState<WalletAccount | null>(network.getActiveWallet());
  const [contractState, setContractState] = useState<SealedBidAuctionState>(network.getContractState());

  // Active Tab
  const [activeTab, setActiveTab] = useState<'lots' | 'proof_studio' | 'escrow' | 'explorer' | 'audit'>('lots');
  const [selectedLotId, setSelectedLotId] = useState<string>('lot-1');

  // Form states for bidding
  const [bidAmount, setBidAmount] = useState<number>(550);
  const [secretSalt, setSecretSalt] = useState<string>(generateSecretSalt());
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Status notification states
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [verificationLoading, setVerificationLoading] = useState<boolean>(false);
  const [proofLog, setProofLog] = useState<ProofLogEntry[]>([]);

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

  return {
    wallets,
    activeWallet,
    contractState,
    activeTab,
    setActiveTab,
    selectedLotId,
    bidAmount,
    setBidAmount,
    secretSalt,
    setSecretSalt,
    copySuccess,
    statusMessage,
    setStatusMessage,
    verificationLoading,
    proofLog,
    adversaryMode,
    setAdversaryMode,
    fakeAmount,
    setFakeAmount,
    voteNullifier,
    timeLeft,
    currentLot,
    computedCommitment,
    computedNullifier,
    handleWalletSwitch,
    handleSelectLot,
    handleCopySalt,
    handleSubmitBid,
    handleCloseAuction,
    handleRevealAndVerify,
    handleSettleEscrow,
    handleCastVote
  };
}
