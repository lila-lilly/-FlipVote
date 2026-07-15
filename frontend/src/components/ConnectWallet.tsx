interface ConnectWalletProps {
  address: string | null;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

function truncate(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function ConnectWallet({ address, connecting, onConnect, onDisconnect }: ConnectWalletProps) {
  if (address) {
    return (
      <button className="terminal-btn terminal-btn--ghost" onClick={onDisconnect}>
        <span className="terminal-dot terminal-dot--live" />
        {truncate(address)} · disconnect
      </button>
    );
  }
  return (
    <button className="terminal-btn" onClick={onConnect} disabled={connecting}>
      {connecting ? "Opening wallet…" : "Connect wallet to vote"}
    </button>
  );
}
