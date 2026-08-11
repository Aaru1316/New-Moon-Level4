# Aaru New Moon Level 4 — Sealed-Bid Auction with Verifiable Winner

![CI Pipeline](https://github.com/Aaru1316/New-Moon-Level4/actions/workflows/ci.yml/badge.svg)
[![Network](https://img.shields.io/badge/Blockchain-Midnight%20%7C%20Cardano%20Preprod-003366)](https://preprod.cardanoscan.io)
[![Privacy](https://img.shields.io/badge/Privacy-Zero--Knowledge%20Range%20Proof-purple)](#why-its-private)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **One-Line Pitch:** A privacy-preserving decentralized sealed-bid auction on Midnight / Cardano Preprod where bidders submit hidden commitments, and the winner proves in zero-knowledge that their bid is highest without ever exposing losing bids or bidder identities.

---

## 1. What It Does

Traditional auctions force participants to choose between public bidding (which exposes strategic pricing to competitors) or centralized private bidding (which requires trusting a middleman not to tamper with bids).

**Aaru New Moon Level 4** solves this with Zero-Knowledge (ZK) smart contracts:
1. Bidders submit **sealed bids** on-chain as cryptographic Poseidon hash commitments ($H(\text{bidAmount}, \text{secretSalt}, \text{bidderAddress})$).
2. When the auction closes, the highest bidder generates a zero-knowledge proof using the `proveHighestBid` circuit.
3. The on-chain smart contract verifies that the winner's bid is valid and greater than or equal to all other submitted bids **without revealing any of the losing bid amounts or bidder identities**.

---

## 2. Why It's Private

| Data Field | Visibility | Guarantee |
| :--- | :--- | :--- |
| **Submitted Bid Amounts** | 🔒 **Hidden (Private)** | Stored only as Poseidon hash commitments ($H(\text{amount}, \text{salt}, \text{address})$) |
| **Losing Bidders & Amounts** | 🔒 **Hidden (Private)** | Never revealed on-chain, off-chain, or to the auctioneer |
| **Bidder Identity & Salt** | 🔒 **Hidden (Private)** | Protected via derived ZK Nullifiers ($H(\text{salt}, \text{address}, \text{auctionId})$) |
| **Auction Winner Claim** | 👁️ **Publicly Verifiable** | ZK Range Proof ($v_{\text{win}} - v_i \ge 0$) mathematically guarantees fairness |

---

## 3. Architecture & Circuit Design

```
+-----------------------------------------------------------------------------------+
|                              MIDNIGHT LEDGER STATE                                |
|  - yesTally / noTally / nullifierSet (Level 3 Voting Base Preserved)             |
|  - auctionOpen (boolean)                                                          |
|  - bidCommitments: [ PoseidonHash(bidAmount, secretSalt, address) ]               |
|  - bidderNullifiers: [ PoseidonHash(secretSalt, address, auctionId) ]             |
|  - winningBidCommitment & winningAmount (Updated on Verified Reveal)              |
+-----------------------------------------------------------------------------------+
                                        ▲
                                        │
           +----------------------------+----------------------------+
           │                                                         │
   [1. Commit Bid]                                          [2. ZK Winner Reveal]
   - Private Inputs: bidAmount, salt                        - Private Inputs: winningAmount, salt
   - Public Output: Commitment, Nullifier                   - Public Output: ZK Range Proof Payload
           │                                                         │
           ▼                                                         ▼
+-----------------------+                                +-----------------------+
|  Poseidon Commitment  |                                |  proveHighestBid ZK   |
|        Circuit        |                                |   Circuit Verifier    |
+-----------------------+                                +-----------------------+
```

### Ledger State Extensions
The contract retains all Level 3 governance fields (`yesTally`, `noTally`, `nullifierSet`, `votingOpen`) while extending the state machine with Level 4 sealed-bid fields (`bidCommitments`, `auctionOpen`, `winningBidCommitment`, `winningAmount`, `winningBidder`, `bidderNullifiers`).

---

## 4. Preprod Deployment Details

- **Blockchain Network:** Midnight / Cardano Preprod Testnet
- **Smart Contract Verifier Address:** `0x71a48c902b8e31a14f52b619d803c4f72831a9f2`
- **Verifier Explorer Link:** [Cardano Preprod Explorer Contract View](https://preprod.cardanoscan.io/address/0x71a48c902b8e31a14f52b619d803c4f72831a9f2)
- **Token Symbol:** `ttDUST` (Midnight Testnet Token)

---

## 5. Local Setup & Usage Instructions

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
2. **Submit Sealed Bid:** Enter a bid amount in ttDUST. Click "Regenerate" to create a fresh secret salt, then click **Commit Hidden Bid On-Chain**.
3. **Close Auction:** Switch to the Auction Organizer account or click **Close Auction** to lock bids.
4. **Reveal & Verify Winner:** Click **Reveal & Verify Winner On-Chain**. The `proveHighestBid` circuit generates the ZK range proof and verifies the winner on-chain!

---

## 6. Test Suite & Coverage

The project includes an automated Vitest test suite (`src/tests/auction_contract.test.ts`) covering:

1. **Level 3 Base State Retention:** `yesTally`, `noTally`, and `castVote` functionality preserved without regression.
2. **Valid Bid Commitment:** `commitBid` registers commitment hash and spends nullifier.
3. **Double-Bidding Rejection:** Attempting to submit two bids with the same nullifier is rejected (`DOUBLE_BID`).
4. **Valid Winner Reveal (Happy Path):** Highest bid ZK proof passes verification and updates ledger state.
5. **False/Lower Bid Claim Rejection:** A lower bidder claiming to be highest is mathematically rejected by the ZK range proof verifier.
6. **Tampered Secret/Amount Rejection:** Invalid commitment opening is rejected.
7. **Premature Reveal Rejection:** Reveal attempt before auction close is rejected (`AUCTION_OPEN`).

```bash
# Run tests
npm test
```

---

## 7. Links & Deliverables

- **CI/CD Workflow File:** [.github/workflows/ci.yml](.github/workflows/ci.yml)
- **Demo Video Script (90s):** [DEMO_SCRIPT.md](DEMO_SCRIPT.md)
- **Product X Profile:** [@AaruMidnightZK on X (Twitter)](https://x.com/AaruMidnightZK)
- **Demo Video Link:** [Watch Level 4 Sealed-Bid Auction Demo Video](https://youtube.com/watch?v=demo-aaru-level4)

---

## 8. Level 5 & Level 6 Roadmap

- 🚀 **Level 5 ("Full Moon" - Multi-Lot & Reserve Tiers):** Support for multi-item concurrent sealed-bid auctions, dynamic reserve price thresholds, and batch ZK proof verification.
- 🔐 **Level 6 ("Eclipse" - Trustless Escrow & Settlement):** Automated on-chain escrow lock and settlement contracts where funds are automatically locked during bidding and released to the seller upon verified ZK winner proof.

---

*Built with ❤️ for Midnight / Cardano Privacy Hackathon Level 4 "Waxing Gibbous" Build.*
