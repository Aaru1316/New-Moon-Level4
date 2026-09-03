import { describe, it, expect, beforeEach } from 'vitest';
import { SealedBidAuctionContract } from '../contracts/auction_contract';
import { SealedBidCircuit } from '../circuits/sealed_bid_circuit';
import { computeBidCommitment, computeBidNullifier, generateSecretSalt } from '../circuits/poseidon';

describe('SealedBidAuctionContract — Level 5 & 6 Aaru Eclipse Test Suite', () => {
  let contract: SealedBidAuctionContract;
  const auctionId = 'test-eclipse-001';

  const aliceAddr = '0xalice11111111111111111111111111111111111';
  const bobAddr = '0xbob2222222222222222222222222222222222222';
  const charlieAddr = '0xcharlie333333333333333333333333333333333';

  beforeEach(() => {
    contract = new SealedBidAuctionContract(auctionId);
  });

  // 1. Level 3 Base State Preservation
  it('preserves Level 3 base voting functionality without regression', () => {
    const initialState = contract.getState();
    expect(initialState.yesTally).toBe(0);
    expect(initialState.noTally).toBe(0);
    expect(initialState.votingOpen).toBe(true);

    const vote1 = contract.castVote('yes', 'nullifier-vote-1');
    expect(vote1.success).toBe(true);
    expect(contract.getState().yesTally).toBe(1);

    const vote2 = contract.castVote('no', 'nullifier-vote-2');
    expect(vote2.success).toBe(true);
    expect(contract.getState().noTally).toBe(1);

    // Double vote with same nullifier should fail
    const doubleVote = contract.castVote('yes', 'nullifier-vote-1');
    expect(doubleVote.success).toBe(false);
    expect(doubleVote.error).toBe('DOUBLE_VOTE');
  });

  // 2. Multi-Lot Initialization
  it('initializes 3 default multi-lot items with reserve prices and custom auction types', () => {
    const state = contract.getState();
    expect(state.lots.length).toBe(3);

    const lot1 = state.lots.find(l => l.lotId === 'lot-1');
    expect(lot1).toBeDefined();
    expect(lot1?.reservePrice).toBe(400);

    const lot2 = state.lots.find(l => l.lotId === 'lot-2');
    expect(lot2?.auctionType).toBe('vickrey');
  });

  // 3. Sealed Bid Commitment & Escrow Collateral
  it('registers sealed bid commitment and locks escrow collateral', () => {
    const saltAlice = generateSecretSalt();
    const commitmentAlice = computeBidCommitment(600, saltAlice, aliceAddr, 'lot-1');
    const nullifierAlice = computeBidNullifier(saltAlice, aliceAddr, auctionId, 'lot-1');

    const result = contract.commitLotBid(aliceAddr, commitmentAlice, nullifierAlice, 'lot-1', 600);
    expect(result.success).toBe(true);

    const state = contract.getState();
    expect(state.bidCommitments.length).toBe(1);
    expect(state.totalEscrowLocked).toBe(600);
    expect(state.bidderNullifiers.includes(nullifierAlice)).toBe(true);
  });

  // 4. Double Bidding Rejection per Lot
  it('rejects double bidding with the same nullifier on the same lot', () => {
    const salt = generateSecretSalt();
    const commitment = computeBidCommitment(600, salt, aliceAddr, 'lot-1');
    const nullifier = computeBidNullifier(salt, aliceAddr, auctionId, 'lot-1');

    contract.commitLotBid(aliceAddr, commitment, nullifier, 'lot-1', 600);

    const result2 = contract.commitLotBid(aliceAddr, commitment, nullifier, 'lot-1', 600);
    expect(result2.success).toBe(false);
    expect(result2.error).toBe('DOUBLE_BID');
  });

  // 5. Premature Reveal Rejection
  it('rejects winner reveal when auction lot is still active', () => {
    const saltAlice = generateSecretSalt();
    const commitmentAlice = computeBidCommitment(600, saltAlice, aliceAddr, 'lot-1');
    const nullifierAlice = computeBidNullifier(saltAlice, aliceAddr, auctionId, 'lot-1');

    contract.commitLotBid(aliceAddr, commitmentAlice, nullifierAlice, 'lot-1', 600);

    const proofPayload = SealedBidCircuit.generateHighestBidProof(
      { winningAmount: 600, secretSalt: saltAlice, bidderAddress: aliceAddr, lotId: 'lot-1' },
      { auctionId, lotId: 'lot-1', bidCommitments: contract.getState().bidCommitments, auctionOpen: true, reservePrice: 400 }
    );

    const revealResult = contract.revealAndVerifyLotWinner(proofPayload);
    expect(revealResult.success).toBe(false);
    expect(revealResult.error).toBe('VERIFICATION_FAILED');
  });

  // 6. Valid ZK Winner Verification & Reserve Price Threshold
  it('verifies valid highest bidder zero-knowledge proof and satisfies reserve price', () => {
    const saltAlice = generateSecretSalt();
    const saltBob = generateSecretSalt();

    const commitAlice = computeBidCommitment(800, saltAlice, aliceAddr, 'lot-1');
    const nullAlice = computeBidNullifier(saltAlice, aliceAddr, auctionId, 'lot-1');

    const commitBob = computeBidCommitment(550, saltBob, bobAddr, 'lot-1');
    const nullBob = computeBidNullifier(saltBob, bobAddr, auctionId, 'lot-1');

    contract.commitLotBid(aliceAddr, commitAlice, nullAlice, 'lot-1', 800);
    contract.commitLotBid(bobAddr, commitBob, nullBob, 'lot-1', 550);

    contract.closeLotAuction('lot-1');

    const allBidsData = [
      { amount: 800, salt: saltAlice, address: aliceAddr, lotId: 'lot-1' },
      { amount: 550, salt: saltBob, address: bobAddr, lotId: 'lot-1' }
    ];

    const proofPayload = SealedBidCircuit.generateHighestBidProof(
      { winningAmount: 800, secretSalt: saltAlice, bidderAddress: aliceAddr, lotId: 'lot-1', allBidsData },
      { auctionId, lotId: 'lot-1', bidCommitments: contract.getState().bidCommitments, auctionOpen: false, reservePrice: 400 }
    );

    const revealResult = contract.revealAndVerifyLotWinner(proofPayload);
    expect(revealResult.success).toBe(true);

    const lot = contract.getState().lots.find(l => l.lotId === 'lot-1');
    expect(lot?.status).toBe('verified');
    expect(lot?.winningBidder).toBe(aliceAddr);
    expect(lot?.winningAmount).toBe(800);
  });

  // 7. Adversarial Tampered Claim Rejection
  it('mathematically rejects a lower bidder claiming to be highest', () => {
    const saltAlice = generateSecretSalt();
    const saltBob = generateSecretSalt();

    const commitAlice = computeBidCommitment(900, saltAlice, aliceAddr, 'lot-1');
    const nullAlice = computeBidNullifier(saltAlice, aliceAddr, auctionId, 'lot-1');

    const commitBob = computeBidCommitment(500, saltBob, bobAddr, 'lot-1');
    const nullBob = computeBidNullifier(saltBob, bobAddr, auctionId, 'lot-1');

    contract.commitLotBid(aliceAddr, commitAlice, nullAlice, 'lot-1', 900);
    contract.commitLotBid(bobAddr, commitBob, nullBob, 'lot-1', 500);

    contract.closeLotAuction('lot-1');

    const allBidsData = [
      { amount: 900, salt: saltAlice, address: aliceAddr, lotId: 'lot-1' },
      { amount: 500, salt: saltBob, address: bobAddr, lotId: 'lot-1' }
    ];

    // Bob attempts to claim he won with 500 ttDUST
    const fakePayload = SealedBidCircuit.generateHighestBidProof(
      { winningAmount: 500, secretSalt: saltBob, bidderAddress: bobAddr, lotId: 'lot-1', allBidsData },
      { auctionId, lotId: 'lot-1', bidCommitments: contract.getState().bidCommitments, auctionOpen: false, reservePrice: 400 }
    );

    const result = contract.revealAndVerifyLotWinner(fakePayload);
    expect(result.success).toBe(false);
    expect(result.error).toBe('VERIFICATION_FAILED');
  });

  // 8. Escrow Vault Settlement & Automated Refunds
  it('settles escrow and marks losing bids as refunded', () => {
    const saltAlice = generateSecretSalt();
    const saltBob = generateSecretSalt();

    const commitAlice = computeBidCommitment(1000, saltAlice, aliceAddr, 'lot-1');
    const nullAlice = computeBidNullifier(saltAlice, aliceAddr, auctionId, 'lot-1');

    const commitBob = computeBidCommitment(600, saltBob, bobAddr, 'lot-1');
    const nullBob = computeBidNullifier(saltBob, bobAddr, auctionId, 'lot-1');

    contract.commitLotBid(aliceAddr, commitAlice, nullAlice, 'lot-1', 1000);
    contract.commitLotBid(bobAddr, commitBob, nullBob, 'lot-1', 600);

    contract.closeLotAuction('lot-1');

    const allBidsData = [
      { amount: 1000, salt: saltAlice, address: aliceAddr, lotId: 'lot-1' },
      { amount: 600, salt: saltBob, address: bobAddr, lotId: 'lot-1' }
    ];

    const proofPayload = SealedBidCircuit.generateHighestBidProof(
      { winningAmount: 1000, secretSalt: saltAlice, bidderAddress: aliceAddr, lotId: 'lot-1', allBidsData },
      { auctionId, lotId: 'lot-1', bidCommitments: contract.getState().bidCommitments, auctionOpen: false, reservePrice: 400 }
    );

    contract.revealAndVerifyLotWinner(proofPayload);

    const settleResult = contract.settleLotEscrow('lot-1');
    expect(settleResult.success).toBe(true);

    const lot = contract.getState().lots.find(l => l.lotId === 'lot-1');
    expect(lot?.status).toBe('settled');

    const bobCommitment = contract.getState().bidCommitments.find(b => b.bidderAddress === bobAddr);
    expect(bobCommitment?.isRefunded).toBe(true);
  });
});
