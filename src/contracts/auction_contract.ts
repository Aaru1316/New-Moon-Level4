/**
 * Midnight Smart Contract: Sealed-Bid Multi-Lot Auction with ZK Escrow & Verifiable Settlement
 * Preserves Level 3 Base Voting Ledger State while upgrading to Level 5 & 6 Sealed-Bid Privacy Capabilities.
 */

import { SealedBidAuctionState, ContractExecutionResult, HighestBidProofPayload, AuctionLot, ManagedFolder, ManagedFile } from '../types/ledger';
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
        imageUrl: '/lot_cyber_core.jpg',
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
        imageUrl: '/lot_validator_key.jpg',
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
        imageUrl: '/logo.jpg',
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

    const defaultManagedFolders: ManagedFolder[] = [
      {
        id: 'folder-lot-1',
        name: 'Cybernetic Void Core #804 Assets',
        description: 'Encrypted hi-res generative art metadata, 3D model GLB, and seller provenance signature.',
        associatedLotId: 'lot-1',
        category: 'NFT Assets',
        accessPolicy: 'Winner Only',
        isLocked: false,
        createdAt: Date.now() - 86400000 * 2,
        createdBy: '0x99887766554433221100aabbccddeeff00112233',
        files: [
          {
            id: 'file-101',
            name: 'cybernetic_core_master.glb',
            sizeBytes: 14580000,
            fileType: '3d/glb',
            poseidonHash: '0x9a8f7c6e5d4c3b2a1f0e9d8c7b6a5f4e',
            ipfsCid: 'bafybeigdyr321voidcore804masterhash',
            uploadedAt: Date.now() - 86400000 * 2,
            privacyLevel: 'encrypted'
          },
          {
            id: 'file-102',
            name: 'provenance_manifest.json',
            sizeBytes: 4200,
            fileType: 'application/json',
            poseidonHash: '0x1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e',
            ipfsCid: 'bafybeicertificateprovenance804',
            uploadedAt: Date.now() - 86400000 * 2,
            privacyLevel: 'public'
          }
        ]
      },
      {
        id: 'folder-lot-2',
        name: 'ZK Validator Node Key Credentials',
        description: 'Validator auth certificates, private key share commitment, and node config payload.',
        associatedLotId: 'lot-2',
        category: 'Validator Keys',
        accessPolicy: 'Bidder Restricted',
        isLocked: false,
        createdAt: Date.now() - 86400000,
        createdBy: '0x99887766554433221100aabbccddeeff00112233',
        files: [
          {
            id: 'file-201',
            name: 'validator_key_share.pem.zk',
            sizeBytes: 2048,
            fileType: 'application/x-pem',
            poseidonHash: '0xef8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b',
            ipfsCid: 'bafybeivalidatorkeycluster09cert',
            uploadedAt: Date.now() - 86400000,
            privacyLevel: 'zk-proof'
          }
        ]
      },
      {
        id: 'folder-lot-3',
        name: 'Midnight Genesis Protocol Rights',
        description: 'Protocol tier-1 governance token rights and fee discount redemption certificate.',
        associatedLotId: 'lot-3',
        category: 'Protocol Credentials',
        accessPolicy: 'Winner Only',
        isLocked: true,
        createdAt: Date.now() - 43200000,
        createdBy: '0x99887766554433221100aabbccddeeff00112233',
        files: [
          {
            id: 'file-301',
            name: 'genesis_pass_rights_v1.pdf',
            sizeBytes: 520000,
            fileType: 'application/pdf',
            poseidonHash: '0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
            ipfsCid: 'bafybeigenesispassprotocolrights',
            uploadedAt: Date.now() - 43200000,
            privacyLevel: 'encrypted'
          }
        ]
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
      managedFolders: defaultManagedFolders,
      isVerified: false,
      auditLogs: [
        {
          timestamp: Date.now(),
          action: 'INITIALIZE',
          details: `Multi-Lot ZK Auction Contract initialized on Midnight Preprod (3 active lots, 3 managed folders)`,
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

  // =========================================================================
  // Managed Folder Storage Methods
  // =========================================================================
  public createManagedFolder(folderData: Omit<ManagedFolder, 'id' | 'createdAt' | 'files'>): ContractExecutionResult {
    const id = `folder-${Date.now().toString(36)}`;
    const newFolder: ManagedFolder = {
      ...folderData,
      id,
      createdAt: Date.now(),
      files: []
    };

    if (!this.state.managedFolders) {
      this.state.managedFolders = [];
    }

    this.state.managedFolders.push(newFolder);
    const txHash = `0xtx_folder_${Math.floor(Math.random() * 899999 + 100000)}`;

    this.state.auditLogs.push({
      timestamp: Date.now(),
      action: 'CREATE_FOLDER',
      details: `Created Managed Folder [${newFolder.name}] (${newFolder.category})`,
      txHash
    });

    return {
      success: true,
      message: `Managed Folder [${newFolder.name}] created successfully!`,
      txHash,
      updatedState: this.getState()
    };
  }

  public addFileToManagedFolder(folderId: string, fileData: Omit<ManagedFile, 'id' | 'uploadedAt'>): ContractExecutionResult {
    const folder = this.state.managedFolders?.find(f => f.id === folderId);
    if (!folder) {
      return { success: false, message: `Managed folder ${folderId} not found.`, error: 'FOLDER_NOT_FOUND' };
    }

    if (folder.isLocked) {
      return { success: false, message: `Managed folder [${folder.name}] is locked. Unlock before adding files.`, error: 'FOLDER_LOCKED' };
    }

    const newFile: ManagedFile = {
      ...fileData,
      id: `file-${Date.now().toString(36)}`,
      uploadedAt: Date.now()
    };

    folder.files.push(newFile);
    const txHash = `0xtx_file_${Math.floor(Math.random() * 899999 + 100000)}`;

    this.state.auditLogs.push({
      timestamp: Date.now(),
      action: 'ADD_FILE',
      details: `Added file [${newFile.name}] to Managed Folder [${folder.name}]`,
      txHash
    });

    return {
      success: true,
      message: `File [${newFile.name}] added to [${folder.name}]!`,
      txHash,
      updatedState: this.getState()
    };
  }

  public toggleLockManagedFolder(folderId: string): ContractExecutionResult {
    const folder = this.state.managedFolders?.find(f => f.id === folderId);
    if (!folder) {
      return { success: false, message: `Managed folder ${folderId} not found.`, error: 'FOLDER_NOT_FOUND' };
    }

    folder.isLocked = !folder.isLocked;
    const txHash = `0xtx_lock_${Math.floor(Math.random() * 899999 + 100000)}`;

    this.state.auditLogs.push({
      timestamp: Date.now(),
      action: folder.isLocked ? 'LOCK_FOLDER' : 'UNLOCK_FOLDER',
      details: `${folder.isLocked ? 'Locked' : 'Unlocked'} Managed Folder [${folder.name}]`,
      txHash
    });

    return {
      success: true,
      message: `Managed Folder [${folder.name}] is now ${folder.isLocked ? 'Locked' : 'Unlocked'}.`,
      txHash,
      updatedState: this.getState()
    };
  }

  public deleteManagedFolder(folderId: string): ContractExecutionResult {
    const folderIndex = this.state.managedFolders?.findIndex(f => f.id === folderId);
    if (folderIndex === undefined || folderIndex === -1) {
      return { success: false, message: `Managed folder ${folderId} not found.`, error: 'FOLDER_NOT_FOUND' };
    }

    const folderName = this.state.managedFolders[folderIndex].name;
    this.state.managedFolders.splice(folderIndex, 1);
    const txHash = `0xtx_del_folder_${Math.floor(Math.random() * 899999 + 100000)}`;

    this.state.auditLogs.push({
      timestamp: Date.now(),
      action: 'DELETE_FOLDER',
      details: `Deleted Managed Folder [${folderName}]`,
      txHash
    });

    return {
      success: true,
      message: `Managed Folder [${folderName}] removed.`,
      txHash,
      updatedState: this.getState()
    };
  }
}
