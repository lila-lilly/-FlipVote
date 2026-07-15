<div align="center">
  
# 🔨 FlipVote - Live On-Chain Polling

**A live-polling voting application built on Stellar & Soroban smart contracts.**  
*FlipVote features a real-time split-flap voting board where the poll results update instantly via real-time event syncing.*

### 🚀 [▶️ Live App](#) <!-- Replace with your actual live app URL -->

</div>

<br />

## ✨ Key Features

1. **Multi-Wallet Integration:** Supports Freighter, xBull, Albedo, Lobstr, and Hana via StellarWalletsKit.
2. **Real-time Event Sync:** Polls the Soroban RPC; every viewer's board updates the instant a new vote lands.
3. **Transaction Status Tracking:** Visual pipeline moving from building → simulating → pending → success/error.
4. **Comprehensive Error Handling:** Gracefully handles wallet connection and contract errors.

---

## 🌐 Smart Contract Deployment (Stellar Testnet)

The smart contract acts as the on-chain polling ledger of record and is deployed to the **Stellar Testnet**.

| Contract | Contract ID | Explorer |
|---|---|---|
| 📜 **FlipVote** | `CDRXV2ENQJYQHY3AIDBOM43WHIU2NRSI3LAJZ52IQTAH3JFKNGP66KYK` | [View on Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDRXV2ENQJYQHY3AIDBOM43WHIU2NRSI3LAJZ52IQTAH3JFKNGP66KYK) |

**Network:** Stellar Testnet  
**RPC URL:** `https://soroban-testnet.stellar.org`  
**Horizon URL:** `https://horizon-testnet.stellar.org`  

### 🔗 Sample On-Chain Transactions

| Action | Transaction Hash | Explorer |
|---|---|---|
| 💸 Contract Deployed | `c95c1cb4684c0aeb0a7aee3b197bfaabecb04b0fb651f2eee1380b4a8ff7c21a` | [View](https://stellar.expert/explorer/testnet/tx/c95c1cb4684c0aeb0a7aee3b197bfaabecb04b0fb651f2eee1380b4a8ff7c21a) |

---

## 📸 Application Showcase

*(Add your screenshots here)*
### 1. Product UI (Placing a Vote)

![Product UI](images/product_ui.png)

### 2. Wallet Connection Options

![Wallet Options](images/wallet_options.png)

### 3. Verified Vote On-Chain

![Verified Vote](images/verified_vote.png)

---

## 🏗️ Architecture

This project is split into three main components:

1. **Smart Contract (`contracts/flipvote/`)**
   - Written in Rust for Soroban.
   - Exposes `initialize`, `vote`, `close_poll`, and `get_poll`.
2. **Frontend Application (`frontend/`)**
   - React + Vite Single Page Application.
   - Integrates with `@creit.tech/stellar-wallets-kit`.
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
