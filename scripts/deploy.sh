#!/usr/bin/env bash
# Builds, deploys, and initializes the FlipVote contract on Stellar testnet.
#
# Prerequisites:
#   - Rust + the wasm32-unknown-unknown target
#   - stellar-cli (https://developers.stellar.org/docs/tools/developer-tools/cli)
#   - An identity funded on testnet: `stellar keys generate admin --network testnet --fund`
#
# Usage:
#   ./scripts/deploy.sh "Best Stellar wallet?" "Freighter" "xBull" "Lobstr"
#
# The first argument is the poll question, the rest are 2-6 options.

set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 \"question\" \"option 1\" \"option 2\" [\"option 3\" ...]"
  exit 1
fi

QUESTION="$1"
shift
OPTIONS=("$@")

NETWORK="testnet"
IDENTITY="admin"
CONTRACT_DIR="contracts/flipvote"
WASM_PATH="target/wasm32-unknown-unknown/release/flipvote.wasm"

echo "==> Building contract"
cd "$(dirname "$0")/.."
cd "$CONTRACT_DIR"
stellar contract build
cd - > /dev/null

echo "==> Optimizing wasm"
stellar contract optimize --wasm "$CONTRACT_DIR/$WASM_PATH"
OPTIMIZED_WASM="${WASM_PATH%.wasm}.optimized.wasm"

echo "==> Deploying to $NETWORK"
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$CONTRACT_DIR/$OPTIMIZED_WASM" \
  --source "$IDENTITY" \
  --network "$NETWORK")

echo "Contract deployed: $CONTRACT_ID"

echo "==> Initializing poll"
ADMIN_ADDRESS=$(stellar keys address "$IDENTITY")

OPTIONS_ARG="["
for i in "${!OPTIONS[@]}"; do
  OPTIONS_ARG+="\"${OPTIONS[$i]}\""
  if [ "$i" -lt $((${#OPTIONS[@]} - 1)) ]; then
    OPTIONS_ARG+=","
  fi
done
OPTIONS_ARG+="]"

stellar contract invoke \
  --id "$CONTRACT_ID" \
  --source "$IDENTITY" \
  --network "$NETWORK" \
  -- \
  initialize \
  --admin "$ADMIN_ADDRESS" \
  --question "$QUESTION" \
  --options "$OPTIONS_ARG"

echo ""
echo "Done. Add this to frontend/.env:"
echo "  VITE_CONTRACT_ID=$CONTRACT_ID"
echo ""
echo "Admin address (keep for close_poll later): $ADMIN_ADDRESS"
