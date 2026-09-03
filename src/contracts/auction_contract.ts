/**
 * Midnight Smart Contract: Sealed-Bid Multi-Lot Auction with ZK Escrow & Verifiable Settlement
 * Preserves Level 3 Base Voting Ledger State while upgrading to Level 5 & 6 Sealed-Bid Privacy Capabilities.
 */

import { SealedBidAuctionState, ContractExecutionResult, HighestBidProofPayload, AuctionLot } from '../types/ledger';
import { SealedBidCircuit } from '../circuits/sealed_bid_circuit';

export class SealedBidAuctionContract {
  private state: SealedBidAuctionState;

  constructor(auctionId: string = 'eclipse-preprod-001') {
    this.state = SealedBidAuctionContract.getInitialState(auctionId);
  }

  /**
   * Initializes contract ledger state combining Level 3 base governance and Level 5/6 multi-lot extensions.
   */
  public static getInitialState(auctionId: string = 'eclipse-preprod-001'): SealedBidAuctionState {
    const defaultLots: AuctionLot[] = [
      {
        lotId: 'lot-1',
        title: 'Cybernetic Void Core #804',
        description: 'Rare animated generative zero-knowledge artifact minted on Midnight Testnet.',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
        category: 'NFT Asset',
        reservePrice: 400,
        auctionType: 'first-price',
        status: 'active',
        winningBidCommitment: null,
        winningAmount: null,
        secondHighestAmount: null,
        winningBidder: null,
        proofTimestamp: null
      },
      {
        lotId: 'lot-2',
        title: 'ZK Validator Node Key (Cluster #09)',
        description: 'Verifiable validator node authorization token for Cardano-Midnight privacy bridge.',
        imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80',
        category: 'Node Key',
        reservePrice: 750,
        auctionType: 'vickrey',
        status: 'active',
        winningBidCommitment: null,
        winningAmount: null,
        secondHighestAmount: null,
        winningBidder: null,
        proofTimestamp: null
      },
      {
        lotId: 'lot-3',
        title: 'Midnight Preprod Genesis Pass',
        description: 'Exclusive tier-1 governance & protocol fee discount pass.',
        imageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=80',
        category: 'Protocol Pass',
        reservePrice: 1200,
        auctionType: 'first-price',
        status: 'active',
        winningBidCommitment: null,
        winningAmount: null,
        secondHighestAmount: null,
        winningBidder: null,
        proofTimestamp: null
      }
    ];

    return {
      // Level 3 Base State (Preserved)
      yesTally: 0,
      noTally: 0,
      nullifierSet: [],
      votingOpen: true,

      // Level 5 & 6 Extended Multi-Lot State
      auctionId,
      blockHeight: 142890,
      totalEscrowLocked: 0,
      lots: defaultLots,
      bidCommitments: [],
      bidderNullifiers: [],
      isVerified: false,
      auditLogs: [
        {
          timestamp: Date.now(),
          action: 'INITIALIZE',
          details: `Multi-Lot ZK Auction Contract initialized on Midnight Preprod (3 active lots)`,
          txHash: `0xtx_init_${Math.floor(Math.random() * 899999 + 100000)}`
        }
      ]
    };
  }

  public getState(): SealedBidAuctionState {
    return JSON.parse(JSON.stringify(this.state));
  }

  // =========================================================================
  // Level 3 Preserved Functionality: castVote
  // =========================================================================
  public castVote(vote: 'yes' | 'no', nullifier: string): ContractExecutionResult {
    if (!this.state.votingOpen) {
      return { success: false, message: 'Voting is closed', error: 'VOTING_CLOSED' };
    }

    if (this.state.nullifierSet.includes(nullifier)) {
      return { success: false, message: 'Nullifier already used', error: 'DOUBLE_VOTE' };
    }

    this.state.nullifierSet.push(nullifier);
    if (vote === 'yes') {
      this.state.yesTally += 1;
    } else {
      this.state.noTally += 1;
    }

    this.state.blockHeight += 1;
    const txHash = `0xtx_vote_${Math.floor(Math.random() * 899999 + 100000)}`;

    this.state.auditLogs.push({
      timestamp: Date.now(),
      action: 'CAST_VOTE',
      details: `Governance vote '${vote}' cast with ZK nullifier ${nullifier.substring(0, 10)}...`,
      txHash
    });

    return {
      success: true,
      message: `Vote '${vote}' cast successfully`,
      txHash,
      updatedState: this.getState()
    };
  }

  // Backward compatible commitBid for single-lot calls
  public commitBid(
    bidderAddress: string,
    commitment: string,
    nullifier: string
  ): ContractExecutionResult {
    return this.commitLotBid(bidderAddress, commitment, nullifier, 'lot-1', 0);
  }

  // =========================================================================
  // Level 5 & 6 Sealed-Bid Auction Functionality: commitLotBid with Escrow
  // =========================================================================
  public commitLotBid(
    bidderAddress: string,
    commitment: string,
    nullifier: string,
    lotId: string = 'lot-1',
    escrowAmount: number = 0
  ): ContractExecutionResult {
    const lot = this.state.lots.find(l => l.lotId === lotId);
    if (!lot) {
      return { success: false, message: `Lot ${lotId} not found.`, error: 'LOT_NOT_FOUND' };
    }

    if (lot.status !== 'active') {
      return {
        success: false,
        message: `Cannot submit bid: Lot ${lot.title} is not active (${lot.status}).`,
        error: 'AUCTION_CLOSED'
      };
    }

    if (this.state.bidderNullifiers.includes(nullifier)) {
      return {
        success: false,
        message: 'Double bidding rejected: Nullifier already used on ledger for this lot.',
        error: 'DOUBLE_BID'
      };
    }

    // Add commitment to ledger state
    this.state.bidCommitments.push({
      commitment,
      timestamp: Date.now(),
      nullifier,
      lotId,
      bidderAddress,
      escrowAmount,
      isEscrowLocked: escrowAmount > 0,
      isRefunded: false
    });

    // Mark nullifier as spent
    this.state.bidderNullifiers.push(nullifier);
    this.state.totalEscrowLocked += escrowAmount;
    this.state.blockHeight += 1;

    const txHash = `0xtx_bid_${Math.floor(Math.random() * 899999 + 100000)}`;

    this.state.auditLogs.push({
      timestamp: Date.now(),
      action: 'COMMIT_BID',
      details: `Bidder ${bidderAddress.substring(0, 10)}... committed bid on [${lot.title}] with ${escrowAmount} ttDUST escrow.`,
      txHash,
      lotId
    });

    return {
      success: true,
      message: `Sealed bid commitment registered on-chain for ${lot.title} with ${escrowAmount} ttDUST locked in escrow.`,
      txHash,
      updatedState: this.getState()
    };
  }

  // Backward compatible closeAuction for default lot
  public closeAuction(): ContractExecutionResult {
    return this.closeLotAuction('lot-1');
  }

  // =========================================================================
  // Level 5 & 6 Auction Functionality: closeLotAuction
  // =========================================================================
  public closeLotAuction(lotId: string = 'lot-1'): ContractExecutionResult {
    const lot = this.state.lots.find(l => l.lotId === lotId);
    if (!lot) {
      return { success: false, message: `Lot ${lotId} not found.`, error: 'LOT_NOT_FOUND' };
    }

    if (lot.status !== 'active') {
      return {
        success: false,
        message: `Lot ${lot.title} is already closed or verified.`,
        error: 'ALREADY_CLOSED'
      };
    }

    lot.status = 'closed';
    this.state.blockHeight += 1;
    const txHash = `0xtx_close_${Math.floor(Math.random() * 899999 + 100000)}`;

    this.state.auditLogs.push({
      timestamp: Date.now(),
      action: 'CLOSE_AUCTION',
      details: `Auction Lot [${lot.title}] closed by organizer. Bids locked for ZK verification.`,
      txHash,
      lotId
    });

    return {
      success: true,
      message: `Auction Lot [${lot.title}] closed. Winner reveal stage enabled.`,
      txHash,
      updatedState: this.getState()
    };
  }

  // Backward compatible revealAndVerifyWinner
  public revealAndVerifyWinner(proofPayload: HighestBidProofPayload): ContractExecutionResult {
    return this.revealAndVerifyLotWinner(proofPayload);
  }

  // =========================================================================
  // Level 5 & 6 Auction Functionality: revealAndVerifyLotWinner
  // =========================================================================
  public revealAndVerifyLotWinner(
    proofPayload: HighestBidProofPayload
  ): ContractExecutionResult {
    const lotId = proofPayload.lotId || 'lot-1';
    const lot = this.state.lots.find(l => l.lotId === lotId);
    if (!lot) {
      return { success: false, message: `Lot ${lotId} not found.`, error: 'LOT_NOT_FOUND' };
    }

    // 1. Verify ZK Proof via Circuit Verifier
    const verification = SealedBidCircuit.verifyHighestBidProof(proofPayload, {
      auctionId: this.state.auctionId,
      lotId,
      bidCommitments: this.state.bidCommitments,
      auctionOpen: lot.status === 'active',
      reservePrice: lot.reservePrice,
      auctionType: lot.auctionType
    });

    if (!verification.valid) {
      const txHash = `0xtx_reject_${Math.floor(Math.random() * 899999 + 100000)}`;
      this.state.auditLogs.push({
        timestamp: Date.now(),
        action: 'VERIFY_REJECTED',
        details: `Winner claim rejected for [${lot.title}]: ${verification.reason}`,
        txHash,
        lotId
      });

      return {
        success: false,
        message: `Winner verification rejected: ${verification.reason}`,
        txHash,
        error: 'VERIFICATION_FAILED'
      };
    }

    // 2. Update lot state with verified winner
    lot.winningBidCommitment = proofPayload.winningCommitment;
    lot.winningAmount = proofPayload.winningAmount;
    lot.secondHighestAmount = proofPayload.secondHighestAmount;
    lot.winningBidder = proofPayload.winningBidder;
    lot.status = 'verified';
    lot.proofTimestamp = Date.now();

    this.state.isVerified = this.state.lots.every(l => l.status === 'verified' || l.status === 'settled');
    this.state.blockHeight += 1;
    const txHash = `0xtx_verify_${Math.floor(Math.random() * 899999 + 100000)}`;

    this.state.auditLogs.push({
      timestamp: Date.now(),
      action: 'VERIFY_SUCCESS',
      details: `Winner verified for [${lot.title}]! Bidder ${proofPayload.winningBidder.substring(0, 10)}... won with ${proofPayload.winningAmount} ttDUST (Reserve: ${lot.reservePrice} ttDUST, Type: ${lot.auctionType}).`,
      txHash,
      lotId
    });

    return {
      success: true,
      message: `Winner ZK proof verified on-chain for [${lot.title}]!`,
      txHash,
      updatedState: this.getState()
    };
  }

  // =========================================================================
  // Level 6 Escrow Vault Settlement: settleLotEscrow
  // =========================================================================
  public settleLotEscrow(lotId: string): ContractExecutionResult {
    const lot = this.state.lots.find(l => l.lotId === lotId);
    if (!lot) {
      return { success: false, message: `Lot ${lotId} not found.`, error: 'LOT_NOT_FOUND' };
    }

    if (lot.status !== 'verified') {
      return {
        success: false,
        message: `Lot [${lot.title}] must be verified before escrow settlement.`,
        error: 'NOT_VERIFIED'
      };
    }

    lot.status = 'settled';

    // Mark losing bid commitments for this lot as refunded
    let refundedCount = 0;
    this.state.bidCommitments.forEach(b => {
      if (b.lotId === lotId && b.bidderAddress.toLowerCase() !== lot.winningBidder?.toLowerCase()) {
        b.isEscrowLocked = false;
        b.isRefunded = true;
        refundedCount++;
      }
    });

    this.state.blockHeight += 1;
    const txHash = `0xtx_settle_${Math.floor(Math.random() * 899999 + 100000)}`;

    this.state.auditLogs.push({
      timestamp: Date.now(),
      action: 'SETTLE_ESCROW',
      details: `Escrow settled for [${lot.title}]. Winning price: ${lot.auctionType === 'vickrey' ? lot.secondHighestAmount : lot.winningAmount} ttDUST transferred to seller. ${refundedCount} losing bids refunded.`,
      txHash,
      lotId
    });

    return {
      success: true,
      message: `Escrow settled and losing bids automatically refunded for [${lot.title}].`,
      txHash,
      updatedState: this.getState()
    };
  }
}
