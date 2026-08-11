import { describe, it, expect, beforeEach } from 'vitest';
import { SealedBidAuctionContract } from '../contracts/auction_contract';
import { computeBidCommitment, computeBidNullifier, generateSecretSalt } from '../circuits/poseidon';
import { SealedBidCircuit } from '../circuits/sealed_bid_circuit';

describe('Sealed-Bid Auction Contract — Level 3 & Level 4 Test Suite', () => {
  let contract: SealedBidAuctionContract;
  const auctionId = 'auction-test-001';

  beforeEach(() => {
    contract = new SealedBidAuctionContract(auctionId);
  });

  // =========================================================================
  // 1. Base Level 3 Voting State Integrity
  // =========================================================================
  describe('Level 3 Base Ledger State', () => {
    it('should retain Level 3 voting fields alongside Level 4 auction fields', () => {
      const state = contract.getState();
      expect(state.yesTally).toBe(0);
      expect(state.noTally).toBe(0);
      expect(state.nullifierSet).toEqual([]);
      expect(state.votingOpen).toBe(true);
      expect(state.auctionId).toBe(auctionId);
      expect(state.auctionOpen).toBe(true);
      expect(state.bidCommitments).toEqual([]);
    });

    it('should successfully execute castVote without affecting auction state', () => {
      const result = contract.castVote('yes', 'nullifier-vote-001');
      expect(result.success).toBe(true);
      expect(contract.getState().yesTally).toBe(1);
      expect(contract.getState().nullifierSet).toContain('nullifier-vote-001');
    });

    it('should reject duplicate vote nullifiers (Level 3 double vote protection)', () => {
      contract.castVote('yes', 'nullifier-vote-001');
      const duplicate = contract.castVote('no', 'nullifier-vote-001');
      expect(duplicate.success).toBe(false);
      expect(duplicate.error).toBe('DOUBLE_VOTE');
    });
  });

  // =========================================================================
  // 2. Bid Commitment & Double-Bidding Prevention
  // =========================================================================
  describe('Bid Commitment Flow (commitBid)', () => {
    it('should successfully register a sealed bid commitment', () => {
      const salt = generateSecretSalt();
      const bidder = '0xBidder1Address';
      const commitment = computeBidCommitment(500, salt, bidder);
      const nullifier = computeBidNullifier(salt, bidder, auctionId);

      const result = contract.commitBid(bidder, commitment, nullifier);
      expect(result.success).toBe(true);

      const state = contract.getState();
      expect(state.bidCommitments.length).toBe(1);
      expect(state.bidCommitments[0].commitment).toBe(commitment);
      expect(state.bidderNullifiers).toContain(nullifier);
    });

    it('should REJECT double-bidding with the same nullifier', () => {
      const salt = generateSecretSalt();
      const bidder = '0xBidder1Address';
      const commitment1 = computeBidCommitment(500, salt, bidder);
      const nullifier = computeBidNullifier(salt, bidder, auctionId);

      // First bid succeeds
      contract.commitBid(bidder, commitment1, nullifier);

      // Second bid with same nullifier fails
      const commitment2 = computeBidCommitment(600, salt, bidder);
      const duplicateResult = contract.commitBid(bidder, commitment2, nullifier);

      expect(duplicateResult.success).toBe(false);
      expect(duplicateResult.error).toBe('DOUBLE_BID');
      expect(contract.getState().bidCommitments.length).toBe(1);
    });

    it('should REJECT bid submission if auction is closed', () => {
      contract.closeAuction();
      const salt = generateSecretSalt();
      const bidder = '0xBidderLate';
      const commitment = computeBidCommitment(1000, salt, bidder);
      const nullifier = computeBidNullifier(salt, bidder, auctionId);

      const result = contract.commitBid(bidder, commitment, nullifier);
      expect(result.success).toBe(false);
      expect(result.error).toBe('AUCTION_CLOSED');
    });
  });

  // =========================================================================
  // 3. Rejection Path: Reveal Before Auction Close
  // =========================================================================
  describe('Auction Close Restrictions', () => {
    it('should REJECT winner reveal attempt while auction is still open', () => {
      const salt = generateSecretSalt();
      const bidder = '0xBidderPremature';
      const commitment = computeBidCommitment(500, salt, bidder);
      const nullifier = computeBidNullifier(salt, bidder, auctionId);

      contract.commitBid(bidder, commitment, nullifier);

      // Construct proof while auction is still open
      const proofPayload = SealedBidCircuit.generateHighestBidProof(
        { winningAmount: 500, secretSalt: salt, bidderAddress: bidder },
        { auctionId, bidCommitments: contract.getState().bidCommitments, auctionOpen: true }
      );

      const result = contract.revealAndVerifyWinner(proofPayload);
      expect(result.success).toBe(false);
      expect(result.error).toBe('VERIFICATION_FAILED');
      expect(result.message).toContain('Auction is still open');
    });
  });

  // =========================================================================
  // 4. Highest-Bid ZK Proof & Verification (Happy & Rejection Paths)
  // =========================================================================
  describe('Highest Bid Reveal & ZK Verification (proveHighestBid)', () => {
    const salt1 = 'salt_bidder_1_secret';
    const salt2 = 'salt_bidder_2_secret';
    const salt3 = 'salt_bidder_3_secret';

    const bidder1 = '0xAlice_Bidder_100';
    const bidder2 = '0xBob_Bidder_350';
    const bidder3 = '0xCharlie_Bidder_250';

    const bid1Amount = 100;
    const bid2Amount = 350; // Highest bid
    const bid3Amount = 250;

    beforeEach(() => {
      // Commit bids for 3 participants
      contract.commitBid(
        bidder1,
        computeBidCommitment(bid1Amount, salt1, bidder1),
        computeBidNullifier(salt1, bidder1, auctionId)
      );

      contract.commitBid(
        bidder2,
        computeBidCommitment(bid2Amount, salt2, bidder2),
        computeBidNullifier(salt2, bidder2, auctionId)
      );

      contract.commitBid(
        bidder3,
        computeBidCommitment(bid3Amount, salt3, bidder3),
        computeBidNullifier(salt3, bidder3, auctionId)
      );

      // Close auction
      contract.closeAuction();
    });

    it('should PASS verification when valid highest bidder (Bob: 350) reveals', () => {
      const allBidsData = [
        { amount: bid1Amount, salt: salt1, address: bidder1 },
        { amount: bid2Amount, salt: salt2, address: bidder2 },
        { amount: bid3Amount, salt: salt3, address: bidder3 }
      ];

      const proofPayload = SealedBidCircuit.generateHighestBidProof(
        {
          winningAmount: bid2Amount,
          secretSalt: salt2,
          bidderAddress: bidder2,
          allBidsData
        },
        {
          auctionId,
          bidCommitments: contract.getState().bidCommitments,
          auctionOpen: false
        }
      );

      const result = contract.revealAndVerifyWinner(proofPayload);
      expect(result.success).toBe(true);

      const updatedState = contract.getState();
      expect(updatedState.isVerified).toBe(true);
      expect(updatedState.winningAmount).toBe(350);
      expect(updatedState.winningBidder).toBe(bidder2);
      expect(updatedState.winningBidCommitment).toBe(
        computeBidCommitment(bid2Amount, salt2, bidder2)
      );
    });

    it('should REJECT when a lower bidder (Alice: 100) falsely claims to be the highest bidder', () => {
      const allBidsData = [
        { amount: bid1Amount, salt: salt1, address: bidder1 },
        { amount: bid2Amount, salt: salt2, address: bidder2 },
        { amount: bid3Amount, salt: salt3, address: bidder3 }
      ];

      // Alice tries to claim she is the winner with bid 100
      const falseProofPayload = SealedBidCircuit.generateHighestBidProof(
        {
          winningAmount: bid1Amount,
          secretSalt: salt1,
          bidderAddress: bidder1,
          allBidsData
        },
        {
          auctionId,
          bidCommitments: contract.getState().bidCommitments,
          auctionOpen: false
        }
      );

      const result = contract.revealAndVerifyWinner(falseProofPayload);
      expect(result.success).toBe(false);
      expect(result.error).toBe('VERIFICATION_FAILED');
      expect(result.message).toContain('claimed bid is not highest');
      expect(contract.getState().isVerified).toBe(false);
    });

    it('should REJECT reveal if winningAmount or secretSalt does not open the commitment', () => {
      // Bob provides wrong salt
      const tamperedProofPayload = SealedBidCircuit.generateHighestBidProof(
        {
          winningAmount: 350,
          secretSalt: 'wrong_fake_salt',
          bidderAddress: bidder2
        },
        {
          auctionId,
          bidCommitments: contract.getState().bidCommitments,
          auctionOpen: false
        }
      );

      const result = contract.revealAndVerifyWinner(tamperedProofPayload);
      expect(result.success).toBe(false);
      expect(result.error).toBe('VERIFICATION_FAILED');
      expect(result.message).toContain('Winning commitment does not exist');
    });

    it('should REJECT reveal if commitment is fake and not present on auction ledger', () => {
      const fakeSalt = generateSecretSalt();
      const fakeBidder = '0xAttacker';
      const fakeCommitmentProof = SealedBidCircuit.generateHighestBidProof(
        {
          winningAmount: 9999,
          secretSalt: fakeSalt,
          bidderAddress: fakeBidder
        },
        {
          auctionId,
          bidCommitments: contract.getState().bidCommitments,
          auctionOpen: false
        }
      );

      const result = contract.revealAndVerifyWinner(fakeCommitmentProof);
      expect(result.success).toBe(false);
      expect(result.error).toBe('VERIFICATION_FAILED');
      expect(result.message).toContain('Winning commitment does not exist on auction ledger');
    });
  });
});
