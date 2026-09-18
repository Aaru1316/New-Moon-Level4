<div align="center">
  <img src="public/x_profile_banner.jpg" alt="Aaru Eclipse Official X Profile Banner" width="100%" />
  <br/><br/>
  <img src="public/logo.jpg" alt="Aaru Eclipse Logo" width="120" style="border-radius: 18px;" />
  <h1>Aaru Eclipse — Privacy-Preserving Multi-Lot ZK Auction Engine</h1>
  <p><strong>Official X (Twitter) Profile:</strong> <a href="https://x.com/aaruarya_13">@aaruarya_13</a></p>
</div>

**Deploy link:** https://new-moon-level4-g55xo64nb-aaru7.vercel.app/

[![CI Pipeline](https://github.com/Aaru1316/New-Moon-Level4/actions/workflows/ci.yml/badge.svg)](https://github.com/Aaru1316/New-Moon-Level4/actions)
[![Network](https://img.shields.io/badge/Blockchain-Midnight%20%7C%20Cardano%20Preprod-003366)](https://preprod.cardanoscan.io)
[![Privacy](https://img.shields.io/badge/Privacy-Zero--Knowledge%20Range%20Proof%20%2B%20Poseidon-purple)](#why-its-private)
[![Escrow](https://img.shields.io/badge/Escrow-Trustless%20ttDUST%20Vault-emerald)](#trustless-escrow)
[![X Profile](https://img.shields.io/badge/X-@aaruarya__13-black?logo=x)](https://x.com/aaruarya_13)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **One-Line Pitch:** A privacy-preserving multi-lot decentralized sealed-bid auction engine on Midnight / Cardano Preprod featuring zero-knowledge range proofs, reserve price verification, trustless `ttDUST` token escrow vaults, and automated losing-bidder refunds.

---

## 1. What It Does

Traditional auctions force participants to choose between public bidding (exposing strategic pricing to competitors) or centralized private bidding (requiring trust in a middleman).

**Aaru Eclipse (Level 5 & 6 Upgrade)** extends privacy-preserving auctions into full multi-lot digital asset markets:
1. Bidders submit **sealed bids** on-chain as cryptographic Poseidon hash commitments ($H(\text{bidAmount}, \text{secretSalt}, \text{bidderAddress}, \text{lotId})$) while locking `ttDUST` collateral into a smart escrow vault.
2. Multiple items (NFT Assets, Validator Node Keys, Protocol Passes) run concurrently with customizable reserve price thresholds and Vickrey (2nd-price) / First-Price settlement models.
3. When an auction lot closes, the highest bidder generates a zero-knowledge proof using the `proveHighestBid & proveReserve` circuit.
4. The smart contract verifies that the winner's bid is valid, satisfies the reserve price, and is greater than or equal to all other submitted bids **without revealing losing bid amounts or bidder identities**.
5. Once verified, the contract automatically settles escrow: winning funds transfer to the seller, and all losing bidders receive instant automated refunds to their wallet balance.

---

## 2. Why It's Private & Verifiable

| Data Field | Visibility | Guarantee |
| :--- | :--- | :--- |
| **Submitted Bid Amounts** | 🔒 **Hidden (Private)** | Stored strictly as Poseidon hash commitments ($H(\text{amount}, \text{salt}, \text{address}, \text{lotId})$) |
| **Losing Bidders & Amounts** | 🔒 **Hidden (Private)** | Never exposed on-chain, off-chain, or to the auctioneer |
| **Bidder Identity & Salt** | 🔒 **Hidden (Private)** | Protected via derived ZK Nullifiers ($H(\text{salt}, \text{address}, \text{auctionId}, \text{lotId})$) |
| **Reserve Price Verification** | 👁️ **Publicly Verifiable** | ZK Proof guarantees $v_{\text{win}} \ge \text{reservePrice}$ without revealing exact bid |
| **Trustless Escrow & Refund** | 🔒 **Verifiable Settlement** | Locked collateral automatically refunded on verified winner reveal |

---

## 3. Architecture & Circuit Design

```
+------------------------------------------------------------------------------------+
|                               MIDNIGHT LEDGER STATE                                |
|  - yesTally / noTally / nullifierSet (Level 3 Governance Preserved)                |
|  - multiLotRegistry: [ Lot#1 Cyber Core, Lot#2 Node Key, Lot#3 Genesis Pass ]      |
|  - bidCommitments: [ PoseidonHash(bidAmount, secretSalt, address, lotId) ]         |
|  - bidderNullifiers: [ PoseidonHash(secretSalt, address, auctionId, lotId) ]       |
|  - totalEscrowLocked & Automated Refund Registry                                   |
+------------------------------------------------------------------------------------+
                                         ▲
                                         │
            +----------------------------+----------------------------+
            │                                                         │
    [1. Commit Sealed Bid]                                   [2. ZK Winner Reveal]
    - Private Inputs: amount, salt                           - Private Inputs: winningAmount, salt
    - Public Output: Commitment, Nullifier                   - Public Output: ZK Range Proof Payload
            │                                                         │
            ▼                                                         ▼
+-----------------------+                                +-----------------------+
| Poseidon Commitment & |                                | proveHighestBid & ZK  |
| Escrow Lock Circuit   |                                | Reserve Verifier      |
+-----------------------+                                +-----------------------+
```

---

## 4. Preprod Deployment Details

- **Blockchain Network:** Midnight / Cardano Preprod Testnet
- **Smart Contract Verifier Address:** `0x71a48c902b8e31a14f52b619d803c4f72831a9f2`
- **Verifier Explorer Link:** [Cardano Preprod Explorer Contract View](https://preprod.cardanoscan.io/address/0x71a48c902b8e31a14f52b619d803c4f72831a9f2)
- **Token Symbol:** `ttDUST` (Midnight Testnet Token)

---

## 5. Midnight Smart Contracts Source Code (`/contracts`)
.
This repository includes native **Compact smart contract source code** written for the Midnight Network ZK privacy sidechain:

- [`contracts/SealedBidAuction.compact`](contracts/SealedBidAuction.compact): Primary Midnight Compact contract with ZK Poseidon commitments, nullifier tracking, reserve price circuits (`prove_highest_bid_and_reserve`), and multi-lot state transitions.
- [`contracts/TrustlessEscrow.compact`](contracts/TrustlessEscrow.compact): Trustless `ttDUST` token escrow vault manager contract handling collateral deposits, winner payouts, and automated losing bidder refunds.
- [`contracts/README.md`](contracts/README.md): Detailed specification, circuit parameters, and compilation guide using `@midnight-ntwrk/compactc`.

---

## 6. Directory Architecture & Modular Design

```
New-Moon-Level4/
├── contracts/                        # Midnight Compact ZK Smart Contract Source Files
│   ├── SealedBidAuction.compact     # Multi-lot ZK sealed-bid auction contract
│   ├── TrustlessEscrow.compact      # Escrow vault & auto-refund contract
│   └── README.md                    # Smart contract spec & compilation guide
├── src/
│   ├── circuits/                     # Off-chain Poseidon & SNARK circuit helpers
│   │   ├── poseidon.ts              # Cryptographic Poseidon hash computation
│   │   └── sealed_bid_circuit.ts    # ZK proof generator & verifier circuits
│   ├── components/                   # Modular UI Component Architecture
│   │   ├── auction/                  # Auction House & Escrow views
│   │   │   ├── AuctionLotsView.tsx
│   │   │   └── EscrowVaultView.tsx
│   │   ├── governance/               # Governance, Audit & ZK Studio views
│   │   │   ├── GovernanceAuditView.tsx
│   │   │   ├── LedgerExplorerView.tsx
│   │   │   └── ZKProofStudioView.tsx
│   │   ├── storage/                  # Managed Folders & Confidential Asset Vault
│   │   │   └── ManagedFolderView.tsx
│   │   ├── layout/                   # Global Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── NavigationTabs.tsx
│   │   │   └── StatusBanner.tsx
│   │   └── index.ts                  # Barrel export file
│   ├── contracts/                    # Frontend TypeScript Contract SDK
│   │   ├── auction_contract.ts      # Ledger state manager & contract transitions
│   │   └── preprod_network.ts       # Midnight testnet RPC network simulator
│   ├── hooks/                        # Application State Hooks
│   │   └── useAuctionNetwork.ts     # React hook orchestrating contract state
│   ├── tests/                        # Vitest Automated Test Suite
│   │   └── auction_contract.test.ts # Contract state & ZK verification tests
│   └── types/                        # TypeScript Domain Definitions
│       └── ledger.ts                # Ledger state types & interfaces
```

---

## 7. Screenshot ##

**Wallet Connect**
![alt text](image.png)

**Vote Predict**
![alt text](image-1.png)

**Zero-Knowledge Proof & Constraint Studio**
![alt text](image-2.png)

**CI Pipeline**
![alt text](image-3.png)

---

## 8. Local Setup & Usage Instructions

### Prerequisites
- Node.js v20+
- npm v10+

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/Aaru1316/New-Moon-Level4.git
cd New-Moon-Level4

# Install dependencies
npm install

# Start local interactive development server
npm run dev

# Run full Vitest test suite
npm test

# Build production bundle
npm run build
```

### User Workflow
1. **Connect Wallet:** Select an active bidder wallet (Alice, Bob, or Charlie) from the top navigation bar.
2. **Select Lot & Commit Sealed Bid:** Choose an active item (e.g. Cyber Core NFT or ZK Validator Node), enter bid amount (must meet reserve price), and click **Commit Sealed Bid On-Chain**. Collateral is locked in ZK escrow.
3. **Close Lot:** Click **Close Lot** to lock bids for zero-knowledge verification.
4. **Verify Winner & Settle Escrow:** Click **Verify ZK Winner**. The `proveHighestBid & proveReserve` circuit verifies the winner on-chain. Then click **Settle Escrow** to automatically refund all losing bidders back to their wallet balance!

---

## 9. Managed Folder UI & Confidential Asset Vault

Aaru Eclipse includes a full **Managed Asset Folder** storage system:
- **Folder Categorization & Lot Linking:** Sellers and auction managers create organized managed folders (`NFT Assets`, `Validator Keys`, `Protocol Credentials`, `Audit Receipts`) tied directly to specific auction lots.
- **Confidentiality & Access Control:** Fine-grained access policies (`Winner Only`, `Bidder Restricted`, `Public Metadata`, `Vault Admin`) ensure asset payloads remain locked until winner verification.
- **Integrity Verification:** Each file within a managed folder is hashed via Poseidon commitments and mapped to IPFS/Arweave CIDs for instant on-chain integrity checks.
- **Folder Lifecycle Management:** Support for creating new managed folders, uploading encrypted proof files, toggling folder lock status, and removing managed folders.

---

## 10. Test Suite & Coverage

The project includes an automated Vitest test suite (`src/tests/auction_contract.test.ts`) covering:

1. **Level 3 Base State Retention:** `yesTally`, `noTally`, and `castVote` preserved without regression.
2. **Multi-Lot Initial State:** 3 default lots with custom reserve prices and auction types initialized cleanly.
3. **Sealed Bid Commitment:** Poseidon commitment hash registered and escrow collateral locked.
4. **Double-Bidding Rejection:** Attempting to submit two bids with the same nullifier per lot is rejected.
5. **Valid Winner Reveal (Happy Path):** Highest bid ZK proof passes verification and satisfies reserve price.
6. **Adversarial Tamper Rejection:** Lower bidders claiming victory are mathematically rejected.
7. **Escrow Vault Settlement & Refunds:** Automated refund engine marks losing bids as refunded.
8. **Managed Folder Storage:** Folder creation, locking, and encrypted file upload verification.

```bash
# Run tests
npm test
```

---

## 11. Deliverables & Links

- **CI/CD Workflow File:** [.github/workflows/ci.yml](.github/workflows/ci.yml)
- **Demo Video Script:** [DEMO_SCRIPT.md](DEMO_SCRIPT.md)
- **Product X Profile:** [@aaruarya_13 on X (Twitter)](https://x.com/aaruarya_13)
- **Demo Video Link:** [Watch Level 5/6 Sealed-Bid Auction Demo Video](https://youtube.com/watch?v=demo-aaru-level4)

---

*Built with ❤️ for Midnight / Cardano Privacy Hackathon.*
