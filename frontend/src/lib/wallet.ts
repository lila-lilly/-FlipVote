import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule,
  xBullModule,
  AlbedoModule,
  HanaModule,
  LobstrModule,
} from "@creit.tech/stellar-wallets-kit";
import { WalletNotFoundError } from "./errors";

/**
 * One kit instance, shared across the app, wired up with every wallet
 * module the kit ships — this is the "multi-wallet" requirement: the
 * connect modal lets the user pick Freighter, xBull, Albedo, Lobstr, or
 * Hana rather than hardcoding a single provider.
 */
export const walletKit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: [
    new FreighterModule(),
    new xBullModule(),
    new AlbedoModule(),
    new HanaModule(),
    new LobstrModule(),
  ],
});

export interface ConnectedWallet {
  address: string;
  walletId: string;
}

/**
 * Opens the wallet-select modal and resolves once the user has picked a
 * wallet and it has handed back an address. Throws WalletNotFoundError
 * if the chosen wallet isn't actually available in this browser.
 */
export function connectWallet(): Promise<ConnectedWallet> {
  return new Promise((resolve, reject) => {
    walletKit
      .openModal({
        modalTitle: "Connect a wallet to vote",
        onWalletSelected: async (option) => {
          try {
            walletKit.setWallet(option.id);
            const { address } = await walletKit.getAddress();
            resolve({ address, walletId: option.id });
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            if (message.toLowerCase().includes("not installed") || message.toLowerCase().includes("extension")) {
              reject(new WalletNotFoundError(option.name));
            } else {
              reject(err);
            }
          }
        },
        onClosed: (err) => {
          if (err) reject(err);
        },
      })
      .catch(reject);
  });
}

export async function signXdr(xdr: string, address: string): Promise<string> {
  const { signedTxXdr } = await walletKit.signTransaction(xdr, {
    address,
    networkPassphrase: WalletNetwork.TESTNET,
  });
  return signedTxXdr;
}
