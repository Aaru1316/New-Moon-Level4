/**
 * Midnight Ledger State Interface — Level 3 Base + Level 4 Sealed-Bid Extensions
 */

// Level 3 Base Ledger State (Preserved)
export interface BaseVotingState {
  yesTally: number;
  noTally: number;
  nullifierSet: string[]; // nullifiers used for Level 3 voting
  votingOpen: boolean;
}

// Level 4 Sealed-Bid Commitment Entry
export interface BidCommitmentEntry {
  commitment: string;      // Poseidon/Pedersen Hash(bidAmount, secretSalt, bidderAddress)
  timestamp: number;       // On-chain submission timestamp
  nullifier: string;       // Poseidon/Pedersen Hash(secretSalt, bidderAddress, auctionId)
}

// Level 4 Extended Sealed-Bid Auction State
export interface SealedBidAuctionState extends BaseVotingState {
  auctionId: string;
  auctionOpen: boolean;
  bidCommitments: BidCommitmentEntry[];
  bidderNullifiers: string[]; // Set of nullifiers to prevent double-bidding
  winningBidCommitment: string | null;
  winningAmount: number | null;
  winningBidder: string | null;
  isVerified: boolean;
  proofTimestamp: number | null;
}

// ZK Proof Payload for Highest Bid Verification
export interface HighestBidProofPayload {
  auctionId: string;
  winningCommitment: string;
  winningAmount: number;
  winningBidder: string;
  publicCommitmentHashes: string[];
  // Zero-Knowledge Proof Components (Simulated SNARK / Range Proof payload)
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    commitmentOpeningValid: boolean;
    allDifferencesNonNegative: boolean;
    nullifierValid: boolean;
  };
  secretSalt: string; // Provided during reveal for contract opening check
}

// Result of contract execution
export interface ContractExecutionResult {
  success: boolean;
  message: string;
  updatedState?: SealedBidAuctionState;
  error?: string;
}
