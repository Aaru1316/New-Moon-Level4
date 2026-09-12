# Midnight Smart Contracts — Aaru Eclipse

This directory contains the native **Compact smart contracts** for **Aaru Eclipse**, written for the **Midnight Network** (Cardano Zero-Knowledge privacy sidechain).

---

## 📜 Contract Overview

| Contract File | Language | Purpose & Functionality |
| :--- | :--- | :--- |
| [`SealedBidAuction.compact`](SealedBidAuction.compact) | Compact (v0.14+) | Multi-lot sealed-bid auction engine with Poseidon hash commitments, ZK nullifiers, reserve price validation, and Vickrey/1st-price settlement. |
| [`TrustlessEscrow.compact`](TrustlessEscrow.compact) | Compact (v0.14+) | Trustless `ttDUST` token escrow vault manager, handling collateral locking, winner payouts, and automated losing bidder refunds. |

---

## 🔒 Zero-Knowledge Circuits Exposed

### 1. `prove_bid_commitment`
- **Private Inputs:** `bidAmount` ($\text{Uint64}$), `secretSalt` ($\text{Bytes32}$)
- **Public Inputs:** `bidder` ($\text{Address}$), `lotId` ($\text{Uint32}$)
- **Output:** Poseidon Hash Commitment $H(\text{bidAmount}, \text{salt}, \text{bidder}, \text{lotId})$

### 2. `prove_bid_nullifier`
- **Private Inputs:** `secretSalt` ($\text{Bytes32}$)
- **Public Inputs:** `bidder` ($\text{Address}$), `auctionId` ($\text{Bytes32}$), `lotId` ($\text{Uint32}$)
- **Output:** ZK Nullifier $H(\text{salt}, \text{bidder}, \text{auctionId}, \text{lotId})$ preventing double-bidding on ledger.

### 3. `prove_highest_bid_and_reserve`
- **Private Inputs:** `winningAmount` ($\text{Uint64}$), `secretSalt` ($\text{Bytes32}$), `allBidAmounts` ($\text{List<Uint64>}$)
- **Public Inputs:** `winningBidder` ($\text{Address}$), `lotId` ($\text{Uint32}$), `reservePrice` ($\text{Uint64}$)
- **Output:** Zero-knowledge range proof payload proving $v_{\text{win}} \ge \text{reservePrice}$ and $\forall i: v_{\text{win}} \ge v_i$ without exposing losing bid amounts on-chain.

---

## 🛠️ Compilation & Test Workflow

To compile the Compact smart contracts using the Midnight Compact CLI:

```bash
# Install Midnight Compact Compiler
npm install -g @midnight-ntwrk/compactc

# Compile main Sealed-Bid Auction contract
compactc contracts/SealedBidAuction.compact --out-dir dist/contracts

# Compile Escrow Vault contract
compactc contracts/TrustlessEscrow.compact --out-dir dist/contracts
```

To run the TypeScript client & simulator test suite against contract state:

```bash
npm test
```
