# FlipVote

A live, on-chain poll rendered as a split-flap departure board. One
question, up to six options, votes cast straight from a connected
Stellar wallet, tallies that flip in real time as votes land — driven
entirely by a Soroban contract's events.

Built for Level 2 (Orange-adjacent multi-wallet + smart-contract-deployment
track): multi-wallet connect, a deployed testnet contract, frontend→contract
calls, live event sync, and full transaction status tracking.

## Why this project

Every requirement maps to something the board actually needs, not a
bolted-on checklist item:

| Requirement | Where it lives |
|---|---|
| Multi-wallet integration | `frontend/src/lib/wallet.ts` — StellarWalletsKit configured with Freighter, xBull, Albedo, Lobstr, Hana |
| 3+ error types handled | `frontend/src/lib/errors.ts` — `WalletNotFoundError`, `UserRejectedError`, `InsufficientBalanceError`, `AlreadyVotedError` |
| Contract deployed on testnet | `contracts/flipvote/` + `scripts/deploy.sh` |
| Contract called from frontend | `frontend/src/lib/contract.ts` — `vote`, `get_poll`, `get_results`, `has_voted` |
| Transaction status visible | `frontend/src/components/TxStatusBanner.tsx` — building → simulating → pending → success/error |
| Real-time event sync | `subscribeToVoteEvents` polls Soroban RPC `getEvents` for `vote` topics and flips tallies live for every connected viewer |

## Project structure

```
flipvote/
├── contracts/
│   └── flipvote/          # Soroban contract (Rust)
│       ├── src/lib.rs
│       └── src/test.rs
├── frontend/               # React + Vite + TypeScript
│   └── src/
│       ├── lib/            # wallet.ts, contract.ts, errors.ts
│       └── components/     # FlapDigit, FlapRow, PollBoard, ConnectWallet, TxStatusBanner
└── scripts/
    └── deploy.sh           # build → optimize → deploy → initialize
```

## Contract

`contracts/flipvote/src/lib.rs` exposes:

- `initialize(admin, question, options)` — one-time setup, called by you (the admin) at deploy time.
- `vote(voter, option_index)` — requires the voter's signature; rejects double votes and out-of-range indices; emits a `vote` event with the fresh tally vector.
- `get_poll()` / `get_results()` — read the question, options, and current tallies.
- `has_voted(voter)` — lets the frontend decide whether to show the ballot or the results view.
- `close_poll(admin)` — admin-only, freezes further votes.

Run the tests:

```bash
cd contracts/flipvote
cargo test
```

## Deploying the contract yourself

You'll need [stellar-cli](https://developers.stellar.org/docs/tools/developer-tools/cli) and a funded testnet identity.

```bash
stellar keys generate admin --network testnet --fund
./scripts/deploy.sh "What's your favorite Stellar wallet?" "Freighter" "xBull" "Lobstr"
```

The script prints the deployed contract ID — put it in `frontend/.env` as `VITE_CONTRACT_ID`.

> Note: the contract address, transaction hash, and demo link below are
> placeholders. Deploy with the script above and fill these in with your
> own values before submitting — these can't be generated on your behalf,
> since they only exist once you actually sign and broadcast on testnet.

**Deployed contract address:** `PASTE_YOUR_CONTRACT_ID_HERE`
**Transaction hash of a vote call:** `PASTE_A_TX_HASH_HERE` (verify at `https://stellar.expert/explorer/testnet/tx/<hash>`)
**Live demo:** `PASTE_YOUR_VERCEL_OR_NETLIFY_URL_HERE`

## Running the frontend locally

```bash
cd frontend
npm install
cp .env.example .env   # then fill in VITE_CONTRACT_ID
npm run dev
```

Open the printed local URL, connect any supported wallet (make sure it's
set to **Testnet**), and vote. Open the same URL in a second browser/tab
with a different wallet to watch the board flip in real time as the
other vote lands.

## Error handling

| Scenario | How it's surfaced |
|---|---|
| Wallet not installed | `WalletNotFoundError` from the connect flow — shown inline, doesn't crash the app |
| Wallet rejects the signing prompt | `UserRejectedError` — caught around `signXdr`, shown in the status banner |
| Insufficient XLM for fees | `InsufficientBalanceError` — checked via a Horizon balance lookup *before* building the transaction |
| Already voted | `AlreadyVotedError` — the contract itself rejects a second vote from the same address; the frontend also pre-checks `has_voted` to disable the button |

## Transaction status tracking

Every vote goes through visible states in `TxStatusBanner`:
`building` → `simulating` → `pending` (submitted, awaiting confirmation) →
`success` (with a Stellar Expert link) or `error` (with the specific
reason).

## Deploying the frontend

Any static host works (Vercel, Netlify, Cloudflare Pages). Build command
`npm run build`, output directory `dist/`, and set `VITE_CONTRACT_ID` (and
optionally the RPC/Horizon URLs) as environment variables in the host's
dashboard.

## Screenshot

Add a screenshot of the wallet-select modal here before submitting:

`![wallet options](./docs/wallet-options.png)`
