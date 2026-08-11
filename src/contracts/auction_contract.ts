/**
 * Midnight Smart Contract: Sealed-Bid Auction with Verifiable Winner
 * Preserves Level 3 Voting Ledger State while introducing Level 4 ZK Auction Capabilities.
 */

import { SealedBidAuctionState, ContractExecutionResult, HighestBidProofPayload } from '../types/ledger';
import { SealedBidCircuit } from '../circuits/sealed_bid_circuit';

export class SealedBidAuctionContract {
  private state: SealedBidAuctionState;

  constructor(auctionId: string = 'auction-preprod-001') {
    this.state = SealedBidAuctionContract.getInitialState(auctionId);
  }

  /**
   * Initializes contract ledger state combining Level 3 base and Level 4 extensions.
   */
  public static getInitialState(auctionId: string = 'auction-preprod-001'): SealedBidAuctionState {
    return {
      // Level 3 Base State (Preserved)
      yesTally: 0,
      noTally: 0,
      nullifierSet: [],
      votingOpen: true,

      // Level 4 Extended Sealed-Bid Auction State
      auctionId,
      auctionOpen: true,
      bidCommitments: [],
      bidderNullifiers: [],
      winningBidCommitment: null,
      winningAmount: null,
      winningBidder: null,
      isVerified: false,
      proofTimestamp: null
    };
  }

  public getState(): SealedBidAuctionState {
    return { ...this.state };
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

    return {
      success: true,
      message: `Vote '${vote}' cast successfully`,
      updatedState: this.getState()
    };
  }

  // =========================================================================
  // Level 4 Sealed-Bid Auction Functionality: commitBid
  // =========================================================================
  public commitBid(
    bidderAddress: string,
    commitment: string,
    nullifier: string
  ): ContractExecutionResult {
    if (!this.state.auctionOpen) {
      return {
        success: false,
        message: 'Cannot submit bid: Auction is closed.',
        error: 'AUCTION_CLOSED'
      };
    }

    if (this.state.bidderNullifiers.includes(nullifier)) {
      return {
        success: false,
        message: 'Double bidding rejected: Nullifier already used on ledger.',
        error: 'DOUBLE_BID'
      };
    }

    // Add commitment to ledger state
    this.state.bidCommitments.push({
      commitment,
      timestamp: Date.now(),
      nullifier
    });

    // Mark nullifier as spent
    this.state.bidderNullifiers.push(nullifier);

    return {
      success: true,
      message: 'Sealed bid commitment successfully registered on-chain.',
      updatedState: this.getState()
    };
  }

  // =========================================================================
  // Level 4 Sealed-Bid Auction Functionality: closeAuction
  // =========================================================================
  public closeAuction(): ContractExecutionResult {
    if (!this.state.auctionOpen) {
      return {
        success: false,
        message: 'Auction is already closed.',
        error: 'ALREADY_CLOSED'
      };
    }

    this.state.auctionOpen = false;

    return {
      success: true,
      message: 'Auction successfully closed. Submissions locked. Winner reveal stage enabled.',
      updatedState: this.getState()
    };
  }

  // =========================================================================
  // Level 4 Sealed-Bid Auction Functionality: revealAndVerifyWinner
  // =========================================================================
  public revealAndVerifyWinner(
    proofPayload: HighestBidProofPayload
  ): ContractExecutionResult {
    // 1. Verify ZK Proof via Circuit Verifier
    const verification = SealedBidCircuit.verifyHighestBidProof(proofPayload, {
      auctionId: this.state.auctionId,
      bidCommitments: this.state.bidCommitments,
      auctionOpen: this.state.auctionOpen
    });

    if (!verification.valid) {
      return {
        success: false,
        message: `Winner verification rejected: ${verification.reason}`,
        error: 'VERIFICATION_FAILED'
      };
    }

    // 2. Update state with verified winner
    this.state.winningBidCommitment = proofPayload.winningCommitment;
    this.state.winningAmount = proofPayload.winningAmount;
    this.state.winningBidder = proofPayload.winningBidder;
    this.state.isVerified = true;
    this.state.proofTimestamp = Date.now();

    return {
      success: true,
      message: 'Winner ZK proof verified on-chain! Winning bid and verifiable proof recorded.',
      updatedState: this.getState()
    };
  }
}
