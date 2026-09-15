/**
 * Midnight / Cardano Preprod Network Simulator
 * Simulates wallet connections (Lace / Midnight Wallet), ttDUST token escrow locking,
 * transaction submission, block height increments, and ZK contract sync.
 */

import { SealedBidAuctionContract } from './auction_contract';
import { HighestBidProofPayload, ContractExecutionResult, SealedBidAuctionState } from '../types/ledger';
import { computeBidCommitment, computeBidNullifier, generateSecretSalt } from '../circuits/poseidon';
import { SealedBidCircuit, PrivateWinnerInputs } from '../circuits/sealed_bid_circuit';

export interface WalletAccount {
  name: string;
  address: string;
  balance: number; // in ttDUST (Midnight testnet token)
  connected: boolean;
}

export class PreprodNetworkSimulator {
  private contract: SealedBidAuctionContract;
  private activeWallet: WalletAccount | null = null;
  private availableWallets: WalletAccount[] = [
    { name: 'Alice (Bidder 1)', address: '0x3a4b9c1d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b', balance: 2500, connected: true },
    { name: 'Bob (Bidder 2)', address: '0x7e6f5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e', balance: 3500, connected: false },
    { name: 'Charlie (Bidder 3)', address: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', balance: 4200, connected: false },
    { name: 'Auction Organizer', address: '0x99887766554433221100aabbccddeeff00112233', balance: 10000, connected: false }
  ];

  // Client-side local storage of secret salts for bidders (simulating wallet local vault)
  // Key format: `${address}:${lotId}`
  private localVault: Map<string, { amount: number; secretSalt: string; nullifier: string; lotId: string }> = new Map();

  constructor(auctionId: string = 'eclipse-preprod-001') {
    this.contract = new SealedBidAuctionContract(auctionId);
    this.activeWallet = this.availableWallets[0]; // Alice default
  }

  public getWallets(): WalletAccount[] {
    return [...this.availableWallets];
  }

  public getActiveWallet(): WalletAccount | null {
    return this.activeWallet;
  }

  public switchWallet(address: string): WalletAccount | null {
    const target = this.availableWallets.find(w => w.address === address);
    if (target) {
      this.availableWallets.forEach(w => (w.connected = w.address === address));
      this.activeWallet = target;
    }
    return this.activeWallet;
  }

  public getContractState(): SealedBidAuctionState {
    return this.contract.getState();
  }

  /**
   * Submit a sealed bid transaction from active wallet for a specific lot
   */
  public submitSealedBid(
    amount: number,
    lotId: string = 'lot-1'
  ): ContractExecutionResult & { commitment?: string; secretSalt?: string } {
    if (!this.activeWallet) {
      return { success: false, message: 'No wallet connected', error: 'NO_WALLET' };
    }

    if (this.activeWallet.balance < amount) {
      return {
        success: false,
        message: `Insufficient balance (${this.activeWallet.balance} ttDUST available, ${amount} ttDUST required).`,
        error: 'INSUFFICIENT_BALANCE'
      };
    }

    const secretSalt = generateSecretSalt();
    const bidderAddress = this.activeWallet.address;
    const auctionId = this.contract.getState().auctionId;

    const commitment = computeBidCommitment(amount, secretSalt, bidderAddress, lotId);
    const nullifier = computeBidNullifier(secretSalt, bidderAddress, auctionId, lotId);

    const txResult = this.contract.commitLotBid(bidderAddress, commitment, nullifier, lotId, amount);

    if (txResult.success) {
      // Deduct balance from active wallet for escrow collateral
      this.activeWallet.balance -= amount;
      // Save secret salt in wallet local vault
      const key = `${bidderAddress.toLowerCase()}:${lotId}`;
      this.localVault.set(key, { amount, secretSalt, nullifier, lotId });
    }

    return {
      ...txResult,
      commitment,
      secretSalt
    };
  }

  /**
   * Close auction lot transaction
   */
  public closeAuction(lotId: string = 'lot-1'): ContractExecutionResult {
    return this.contract.closeLotAuction(lotId);
  }

  /**
   * Generate ZK Proof & Submit Reveal Transaction for a lot
   */
  public revealAndVerifyWinner(
    lotId: string = 'lot-1',
    overrideInputs?: Partial<PrivateWinnerInputs>
  ): ContractExecutionResult {
    if (!this.activeWallet) {
      return { success: false, message: 'No wallet connected', error: 'NO_WALLET' };
    }

    const bidderAddress = overrideInputs?.bidderAddress || this.activeWallet.address;
    const key = `${bidderAddress.toLowerCase()}:${lotId}`;
    const vaultEntry = this.localVault.get(key);

    const winningAmount = overrideInputs?.winningAmount ?? (vaultEntry ? vaultEntry.amount : 0);
    const secretSalt = overrideInputs?.secretSalt ?? (vaultEntry ? vaultEntry.secretSalt : '');

    // Collect all bids data for this lot from vault for range proof check
    const allBidsData: Array<{ amount: number; salt: string; address: string; lotId: string }> = [];
    this.localVault.forEach((val, k) => {
      if (val.lotId === lotId) {
        const addr = k.split(':')[0];
        allBidsData.push({ amount: val.amount, salt: val.secretSalt, address: addr, lotId });
      }
    });

    const lot = this.contract.getState().lots.find(l => l.lotId === lotId);

    const proofPayload: HighestBidProofPayload = SealedBidCircuit.generateHighestBidProof(
      {
        winningAmount,
        secretSalt,
        bidderAddress,
        lotId,
        allBidsData
      },
      {
        auctionId: this.contract.getState().auctionId,
        lotId,
        bidCommitments: this.contract.getState().bidCommitments,
        auctionOpen: lot ? lot.status === 'active' : false,
        reservePrice: lot ? lot.reservePrice : 0,
        auctionType: lot ? lot.auctionType : 'first-price'
      }
    );

    return this.contract.revealAndVerifyLotWinner(proofPayload);
  }

  /**
   * Settle Escrow & Automatically Refund Losing Bidders
   */
  public settleEscrow(lotId: string = 'lot-1'): ContractExecutionResult {
    const lot = this.contract.getState().lots.find(l => l.lotId === lotId);
    if (!lot) {
      return { success: false, message: `Lot ${lotId} not found`, error: 'LOT_NOT_FOUND' };
    }

    const result = this.contract.settleLotEscrow(lotId);
    if (result.success) {
      // Refund losing bidders
      const commitments = this.contract.getState().bidCommitments.filter(b => b.lotId === lotId);
      commitments.forEach(b => {
        if (b.bidderAddress.toLowerCase() !== lot.winningBidder?.toLowerCase()) {
          const wallet = this.availableWallets.find(w => w.address.toLowerCase() === b.bidderAddress.toLowerCase());
          if (wallet) {
            wallet.balance += b.escrowAmount;
          }
        }
      });
    }

    return result;
  }

  public getVaultEntry(address: string, lotId: string = 'lot-1') {
    const key = `${address.toLowerCase()}:${lotId}`;
    return this.localVault.get(key);
  }

  public castVote(vote: 'yes' | 'no', nullifier: string): ContractExecutionResult {
    return this.contract.castVote(vote, nullifier);
  }

  public createManagedFolder(folderData: any): ContractExecutionResult {
    return this.contract.createManagedFolder(folderData);
  }

  public addFileToManagedFolder(folderId: string, fileData: any): ContractExecutionResult {
    return this.contract.addFileToManagedFolder(folderId, fileData);
  }

  public toggleLockManagedFolder(folderId: string): ContractExecutionResult {
    return this.contract.toggleLockManagedFolder(folderId);
  }

  public deleteManagedFolder(folderId: string): ContractExecutionResult {
    return this.contract.deleteManagedFolder(folderId);
  }

  public requestFaucet(amount: number = 500): { success: boolean; message: string; newBalance: number } {
    if (!this.activeWallet) {
      return { success: false, message: 'No active wallet connected', newBalance: 0 };
    }
    this.activeWallet.balance += amount;
    return {
      success: true,
      message: `Dispensed ${amount} ttDUST testnet tokens from Midnight Preprod Faucet to ${this.activeWallet.name}!`,
      newBalance: this.activeWallet.balance
    };
  }
}
