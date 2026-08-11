/**
 * Midnight / Cardano Preprod Network Simulator
 * Simulates wallet connections (Lace / Midnight Wallet), transaction submission, and contract sync.
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
    { name: 'Alice (Bidder 1)', address: '0x3a4b9c1d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b', balance: 1500, connected: true },
    { name: 'Bob (Bidder 2)', address: '0x7e6f5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e', balance: 2500, connected: false },
    { name: 'Charlie (Bidder 3)', address: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b', balance: 1800, connected: false },
    { name: 'Auction Organizer', address: '0x99887766554433221100aabbccddeeff00112233', balance: 5000, connected: false }
  ];

  // Client-side local storage of secret salts for bidders (simulating wallet local vault)
  private localVault: Map<string, { amount: number; secretSalt: string; nullifier: string }> = new Map();

  constructor(auctionId: string = 'auction-preprod-001') {
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
   * Submit a sealed bid transaction from active wallet
   */
  public submitSealedBid(amount: number): ContractExecutionResult & { commitment?: string; secretSalt?: string } {
    if (!this.activeWallet) {
      return { success: false, message: 'No wallet connected', error: 'NO_WALLET' };
    }

    const secretSalt = generateSecretSalt();
    const bidderAddress = this.activeWallet.address;
    const auctionId = this.contract.getState().auctionId;

    const commitment = computeBidCommitment(amount, secretSalt, bidderAddress);
    const nullifier = computeBidNullifier(secretSalt, bidderAddress, auctionId);

    const txResult = this.contract.commitBid(bidderAddress, commitment, nullifier);

    if (txResult.success) {
      // Save secret salt in wallet local vault
      this.localVault.set(bidderAddress, { amount, secretSalt, nullifier });
    }

    return {
      ...txResult,
      commitment,
      secretSalt
    };
  }

  /**
   * Close auction transaction
   */
  public closeAuction(): ContractExecutionResult {
    return this.contract.closeAuction();
  }

  /**
   * Generate ZK Proof & Submit Reveal Transaction
   */
  public revealAndVerifyWinner(overrideInputs?: Partial<PrivateWinnerInputs>): ContractExecutionResult {
    if (!this.activeWallet) {
      return { success: false, message: 'No wallet connected', error: 'NO_WALLET' };
    }

    const bidderAddress = overrideInputs?.bidderAddress || this.activeWallet.address;
    const vaultEntry = this.localVault.get(bidderAddress);

    const winningAmount = overrideInputs?.winningAmount ?? (vaultEntry ? vaultEntry.amount : 0);
    const secretSalt = overrideInputs?.secretSalt ?? (vaultEntry ? vaultEntry.secretSalt : '');

    // Collect all bids data from vault for range proof check
    const allBidsData: Array<{ amount: number; salt: string; address: string }> = [];
    this.localVault.forEach((val, addr) => {
      allBidsData.push({ amount: val.amount, salt: val.secretSalt, address: addr });
    });

    const proofPayload: HighestBidProofPayload = SealedBidCircuit.generateHighestBidProof(
      {
        winningAmount,
        secretSalt,
        bidderAddress,
        allBidsData
      },
      {
        auctionId: this.contract.getState().auctionId,
        bidCommitments: this.contract.getState().bidCommitments,
        auctionOpen: this.contract.getState().auctionOpen
      }
    );

    return this.contract.revealAndVerifyWinner(proofPayload);
  }

  public getVaultEntry(address: string) {
    return this.localVault.get(address);
  }
}
