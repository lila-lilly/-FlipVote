<div align="center">
  
# 🗳️ FlipVote — Live On-Chain Polling

**A live-polling voting application built on Stellar & Soroban smart contracts.**  
*FlipVote features a real-time split-flap voting board where poll results update instantly for every viewer via Soroban event syncing. Every vote is a real on-chain transaction — fully verifiable on Stellar Expert.*

### 🚀 [▶️ Live App](https://flip-vote.vercel.app/)

</div>

<br />

## ✨ Key Features

1. **Multi-Wallet Integration:** Supports Freighter, xBull, Albedo, Lobstr, and Hana via StellarWalletsKit.
2. **Real-time Event Sync:** Polls the Soroban RPC; every viewer's board updates the instant a new vote lands on-chain.
3. **Transaction Status Tracking:** Visual pipeline moving from building → simulating → pending → success/error.
4. **On-Chain Verification:** After voting, a direct link to Stellar Expert lets users verify their transaction hash instantly.
5. **Comprehensive Error Handling:** Gracefully handles `WalletNotFoundError`, `UserRejectedError`, `InsufficientBalanceError`, and `AlreadyVotedError`.

---

## 📸 Application Showcase

### 1. 🗳️ Live Voting Board — Vote Cast & Confirmed
*The split-flap board shows live tally counts across all 4 options. After voting, the "Verify on-chain ↗" link appears so users can confirm their vote on Stellar Expert.*

![Vote Casted — Live Polling Board](images/vote%20casted.png)

---

### 2. 🔗 On-Chain Transaction Verified on Stellar Expert
*Every vote is a real Soroban smart contract invocation. Users can inspect the full transaction detail — source account, fee, ledger number, and the exact `vote()` call — on Stellar Expert.*

![On-Chain Transaction Verified](images/onchian%20verified.png)

---

### 3. 👛 Multi-Wallet Connect Modal
*FlipVote integrates 5 Stellar wallets via StellarWalletsKit. Users can connect with Freighter, xBull, Albedo, Hana, or LOBSTR to cast their vote.*

![Wallet Connection Options](images/wallet%20options.png)

---

## 🌐 Smart Contract Deployment (Stellar Testnet)

The smart contract acts as the on-chain polling ledger of record and is deployed to the **Stellar Testnet**.

| Contract | Contract ID | Explorer |
|---|---|---|
| 📜 **FlipVote** | `CCD7KBGL4NUFLWPFGJDYSYPFKIVHHI5I5A5YNABGTHEMPVC7HCUBA22U` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CCD7KBGL4NUFLWPFGJDYSYPFKIVHHI5I5A5YNABGTHEMPVC7HCUBA22U) |

**Network:** Stellar Testnet  
**RPC URL:** `https://soroban-testnet.stellar.org`  
**Horizon URL:** `https://horizon-testnet.stellar.org`  

### 🔗 Sample On-Chain Transactions

| Action | Transaction Hash | Explorer |
|---|---|---|
| 📦 Contract Deployed | `9ed79c919750b096c98c68f86d9b585fa8fc8e5d78a8e1704065ed523becb2a7` | [View](https://stellar.expert/explorer/testnet/tx/9ed79c919750b096c98c68f86d9b585fa8fc8e5d78a8e1704065ed523becb2a7) |
| 🗳️ Poll Initialized | `19c10008dfc965e5272e927d9b222c5b2554391e79a1228846a51fbb4684d178` | [View](https://stellar.expert/explorer/testnet/tx/19c10008dfc965e5272e927d9b222c5b2554391e79a1228846a51fbb4684d178) |
| ✅ Sample Vote Cast | `61a0555fe2c97229845472dc45a1ca622d7cb19bb211a6e02d92f4474385bdf1` | [View](https://stellar.expert/explorer/testnet/tx/61a0555fe2c97229845472dc45a1ca622d7cb19bb211a6e02d92f4474385bdf1) |

---

## 🏗️ Architecture

This project is split into three main components:

1. **Smart Contract (`contracts/flipvote/`)**
   - Written in Rust for Soroban.
   - Exposes `initialize`, `vote`, `close_poll`, `get_poll`, and `has_voted`.
2. **Frontend Application (`frontend/`)**
   - React + Vite Single Page Application.
   - Integrates with `@creit.tech/stellar-wallets-kit` for multi-wallet support.
   - Uses `@stellar/stellar-sdk` v14 (Protocol 22 compatible).
3. **Deployment Scripts (`scripts/`)**
   - Automates building, optimizing, deploying, and initializing the contract.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)
- Rust + `wasm32v1-none` target
- Stellar CLI (`cargo install --locked stellar-cli`)

### Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
