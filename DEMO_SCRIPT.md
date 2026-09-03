# Aaru Eclipse — Demo Video Script (90 Seconds)

## Title: Privacy-Preserving Multi-Lot ZK Auction & Trustless Escrow Engine

---

### [0:00 - 0:15] Introduction & The Problem
**Visual:** Screen recording showing the Aaru Eclipse Web App with glowing glassmorphism dashboard, active multi-lot items, and connected Midnight Preprod wallet bar.
**Voiceover:**
"Welcome to Aaru Eclipse — the privacy-preserving multi-lot sealed-bid auction and trustless escrow engine built for Midnight and Cardano Preprod. Traditional auctions force a trade-off between public bid leakage or trusting central middlemen. Aaru Eclipse eliminates this using Zero-Knowledge Range Proofs and Poseidon commitment vaults."

---

### [0:15 - 0:35] Multi-Lot Bidding & Escrow Locking
**Visual:** Presenter selects Alice's wallet, picks Lot #1 ("Cybernetic Void Core NFT"), enters 600 ttDUST bid, and clicks "Commit Sealed Bid On-Chain".
**Voiceover:**
"Bidders submit hidden bid commitments formatted as Poseidon hashes. Simultaneously, testnet ttDUST token collateral is locked into a trustless smart escrow vault. On-chain observers only see Poseidon commitment digests and derived ZK nullifiers — losing bid amounts and bidder identities remain 100% private."

---

### [0:35 - 0:55] Adversarial Security Test & Fraud Rejection
**Visual:** Presenter switches to Bob's wallet, enables 'Adversarial Fraud Tester', tries to claim victory with a fake bid of 100 ttDUST, and clicks 'Verify ZK Winner'. The UI displays 'Verification Rejected'.
**Voiceover:**
"Security is mathematically guaranteed. If a malicious party attempts to claim a win with a fake bid or tampered salt, the smart contract's ZK verifier instantly rejects the proof on-chain."

---

### [0:55 - 1:15] Verifiable Winner Reveal & ZK Proof Studio
**Visual:** Presenter clicks 'Verify ZK Winner' for Alice's valid 600 ttDUST bid. The ZK Proof Studio tab opens showing Groth16/Plonk constraint matrices passing verification.
**Voiceover:**
"When the organizer closes the lot, the winner generates a ZK range proof verifying their bid is highest and meets the reserve price. The verifier validates the proof without ever exposing losing bids."

---

### [1:15 - 1:30] Automated Escrow Settlement & Losing-Bidder Refunds
**Visual:** Presenter clicks 'Settle Escrow'. Bob and Charlie's wallet balances automatically increase as their locked ttDUST collateral is refunded with simulated transaction hashes.
**Voiceover:**
"Finally, escrow settlement transfers the winning price to the seller while automatically refunding all losing bidders back to their wallets. Aaru Eclipse brings true privacy, fairness, and trustless settlement to decentralized Web3 auctions!"

---
