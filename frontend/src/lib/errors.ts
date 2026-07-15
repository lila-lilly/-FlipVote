/**
 * Distinct, typed error classes so the UI can render a specific message
 * and icon per failure mode instead of one generic "something went
 * wrong" banner. Each maps to one of the required error scenarios.
 */

export class WalletNotFoundError extends Error {
  constructor(walletName: string) {
    super(`${walletName} isn't installed or isn't available in this browser.`);
    this.name = "WalletNotFoundError";
  }
}

export class UserRejectedError extends Error {
  constructor() {
    super("The transaction was rejected in the wallet.");
    this.name = "UserRejectedError";
  }
}

export class InsufficientBalanceError extends Error {
  constructor(available: string, required: string) {
    super(
      `This account doesn't hold enough XLM to cover the network fee. ` +
        `Available: ${available} XLM, needed: at least ${required} XLM.`
    );
    this.name = "InsufficientBalanceError";
  }
}

export class AlreadyVotedError extends Error {
  constructor() {
    super("This address has already voted in this poll.");
    this.name = "AlreadyVotedError";
  }
}

export class ContractCallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContractCallError";
  }
}

/**
 * Normalizes errors thrown by the wallets-kit / Soroban RPC / simulation
 * layer into one of the typed errors above, based on substrings those
 * layers are known to throw. Wallet SDKs don't share an error taxonomy,
 * so this is deliberately pattern-based rather than relying on a single
 * error code.
 */
export function classifyError(err: unknown): Error {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (lower.includes("not installed") || lower.includes("not detected") || lower.includes("no wallet")) {
    return new WalletNotFoundError("The selected wallet");
  }
  if (
    lower.includes("rejected") ||
    lower.includes("declined") ||
    lower.includes("user denied") ||
    lower.includes("cancelled") ||
    lower.includes("canceled")
  ) {
    return new UserRejectedError();
  }
  if (lower.includes("insufficient") || lower.includes("underfunded") || lower.includes("balance")) {
    return new InsufficientBalanceError("?", "?");
  }
  if (lower.includes("already voted") || lower.includes("already_voted")) {
    return new AlreadyVotedError();
  }
  return new ContractCallError(message);
}
