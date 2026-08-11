# 🎥 90-Second Demo Video Script — Aaru Level 4 "Waxing Gibbous"
## Project: Sealed-Bid Auction with Verifiable Winner

---

### [0:00 - 0:15] Section 1: The Problem (15 seconds)
**Visual**: Host on camera or screen showing traditional auction interfaces with public bids or centralized servers.
**Voiceover**:
> "Traditional auctions force a painful tradeoff. Public auctions leak strategic pricing to competitors, while private sealed-bid auctions force you to trust a centralized auctioneer who could secretly tamper with bids or pick a fake winner. What if you could run a 100% private sealed-bid auction where the winner is mathematically proven correct using Zero-Knowledge cryptography—without ever revealing losing bids?"

---

### [0:15 - 0:45] Section 2: Live Walkthrough — Submitting Sealed Bids (30 seconds)
**Visual**: Screen recording of the **Aaru New Moon Level 4 dApp** interface on Midnight / Cardano Preprod. Switch wallet dropdown to Alice, enter bid `500 ttDUST`, generate Poseidon salt, click **"Commit Hidden Bid On-Chain"**. Next, switch to Bob (`1,200 ttDUST`) and Charlie (`850 ttDUST`) and repeat.
**Voiceover**:
> "Here in our dApp on Midnight Preprod, three bidders—Alice, Bob, and Charlie—submit sealed bids. Watch closely: when Alice bids 500 ttDUST, her browser generates a secret salt and submits a Poseidon hash commitment to the ledger. On-chain, only the cryptographic commitment and spent nullifier are recorded. The bid amounts are completely hidden!"

---

### [0:45 - 1:05] Section 3: Closing Auction & Verifying Winner (20 seconds)
**Visual**: Click **"Close Auction"**. Click **"Reveal & Verify Winner On-Chain"**. Watch the step-by-step ZK proof verification status indicators light up green: Commitment Opening (PASSED), Range Proof (PASSED), Winner Trophy badge appears (`Bob: 1,200 ttDUST`).
**Voiceover**:
> "Once the countdown ends, the organizer closes the auction. Bob—the highest bidder—initiates the ZK reveal flow. Our `proveHighestBid` circuit generates a Zero-Knowledge Range Proof. The smart contract verifies that Bob's commitment opens validly and that his bid is greater than or equal to all other submitted commitments."

---

### [1:05 - 1:20] Section 4: Proving Privacy & Zero-Knowledge Fairness (15 seconds)
**Visual**: Highlight the losing bids section on the ledger showing `[Amount Hidden]` and zero leaked data for Alice and Charlie. Toggle the Adversary Simulation checkbox and attempt a fake claim to show on-chain rejection.
**Voiceover**:
> "Notice the breakthrough: Alice's and Charlie's losing bid amounts are never revealed to anyone—not even the auctioneer! If an attacker attempts to claim a lower bid as the winner, the ZK verifier rejects it immediately on-chain."

---

### [1:20 - 1:30] Section 5: Call to Action (10 seconds)
**Visual**: Final slide showing GitHub repository link, live Preprod verifier address, and Product X handle `@AaruMidnightZK`.
**Voiceover**:
> "Privacy meets verifiable fairness on Midnight. Check out our open-source code on GitHub, inspect our Preprod smart contract, and follow us on X `@AaruMidnightZK`!"
