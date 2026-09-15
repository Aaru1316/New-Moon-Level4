/**
 * Midnight Ledger State Interface — Level 5 & 6 Aaru Eclipse Protocol
 * Sealed-Bid Multi-Lot Privacy Engine with ZK Escrow & Verifiable Settlement
 */

// Level 3 Base Ledger State (Preserved)
export interface BaseVotingState {
  yesTally: number;
  noTally: number;
  nullifierSet: string[]; // nullifiers used for Level 3 voting
  votingOpen: boolean;
}

// Level 5 & 6 Auction Lot Definition
export interface AuctionLot {
  lotId: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'NFT Asset' | 'Node Key' | 'Protocol Pass' | 'Treasury Vault';
  reservePrice: number;
  auctionType: 'first-price' | 'vickrey';
  status: 'active' | 'closed' | 'verified' | 'settled';
  winningBidCommitment: string | null;
  winningAmount: number | null;
  secondHighestAmount: number | null;
  winningBidder: string | null;
  proofTimestamp: number | null;
}

// Level 5 & 6 Sealed-Bid Commitment Entry
export interface BidCommitmentEntry {
  commitment: string;      // Poseidon Hash(bidAmount, secretSalt, bidderAddress, lotId)
  timestamp: number;       // On-chain submission timestamp
  nullifier: string;       // Poseidon Hash(secretSalt, bidderAddress, auctionId, lotId)
  lotId: string;
  bidderAddress: string;
  escrowAmount: number;    // Locked ttDUST token collateral
  isEscrowLocked: boolean;
  isRefunded?: boolean;
}

// Managed Folder File Definition
export interface ManagedFile {
  id: string;
  name: string;
  sizeBytes: number;
  fileType: string;
  poseidonHash: string;
  ipfsCid: string;
  uploadedAt: number;
  privacyLevel: 'public' | 'encrypted' | 'zk-proof';
}

// Managed Folder Vault Definition
export interface ManagedFolder {
  id: string;
  name: string;
  description: string;
  associatedLotId?: string;
  category: 'NFT Assets' | 'Validator Keys' | 'Protocol Credentials' | 'Audit Receipts' | 'Custom Vault';
  accessPolicy: 'Public Metadata' | 'Bidder Restricted' | 'Winner Only' | 'Vault Admin';
  isLocked: boolean;
  createdAt: number;
  createdBy: string;
  files: ManagedFile[];
}

// Level 5 & 6 Extended Multi-Lot Sealed-Bid Auction State
export interface SealedBidAuctionState extends BaseVotingState {
  auctionId: string;
  blockHeight: number;
  totalEscrowLocked: number;
  lots: AuctionLot[];
  bidCommitments: BidCommitmentEntry[];
  bidderNullifiers: string[]; // Set of nullifiers to prevent double-bidding
  managedFolders: ManagedFolder[];
  isVerified: boolean;
  auditLogs: Array<{
    timestamp: number;
    action: string;
    details: string;
    txHash?: string;
    lotId?: string;
  }>;
}

// ZK Proof Payload for Highest Bid & Reserve Verification
export interface HighestBidProofPayload {
  auctionId: string;
  lotId: string;
  winningCommitment: string;
  winningAmount: number;
  secondHighestAmount: number;
  winningBidder: string;
  publicCommitmentHashes: string[];
  reservePrice: number;
  // Zero-Knowledge Proof Components (Simulated SNARK / Range Proof payload)
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    commitmentOpeningValid: boolean;
    allDifferencesNonNegative: boolean;
    reservePriceSatisfied: boolean;
    vickreyProofValid: boolean;
    nullifierValid: boolean;
  };
  secretSalt: string; // Provided during reveal for contract opening check
}

// Result of contract execution
export interface ContractExecutionResult {
  success: boolean;
  message: string;
  updatedState?: SealedBidAuctionState;
  txHash?: string;
  error?: string;
}
