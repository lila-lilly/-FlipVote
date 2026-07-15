import { useEffect, useState } from "react";
import { ConnectWallet } from "./components/ConnectWallet";
import { PollBoard } from "./components/PollBoard";
import { TxStatusBanner } from "./components/TxStatusBanner";
import { connectWallet } from "./lib/wallet";
import { castVote, getPoll, hasVoted as fetchHasVoted, subscribeToVoteEvents, PollState, TxStatus, CONTRACT_ID } from "./lib/contract";
import { classifyError } from "./lib/errors";

export default function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [poll, setPoll] = useState<PollState | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [txStatus, setTxStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live sync: any vote from any wallet updates everyone's board.
  useEffect(() => {
    const unsubscribe = subscribeToVoteEvents((tallies) => {
      setPoll((prev) => (prev ? { ...prev, tallies } : prev));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;

    (async () => {
      try {
        setPollError(null);
        const [pollState, votedAlready] = await Promise.all([getPoll(address), fetchHasVoted(address, address)]);
        if (cancelled) return;
        setPoll(pollState);
        setVoted(votedAlready);
      } catch (err) {
        if (!cancelled) setPollError(classifyError(err).message);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address]);

  async function handleConnect() {
    setConnecting(true);
    setErrorMessage(null);
    try {
      const { address: connectedAddress } = await connectWallet();
      setAddress(connectedAddress);
    } catch (err) {
      setErrorMessage(classifyError(err).message);
    } finally {
      setConnecting(false);
    }
  }

  function handleDisconnect() {
    setAddress(null);
    setPoll(null);
    setVoted(false);
  }

  async function handleVote(index: number) {
    if (!address) return;
    setVoting(true);
    setErrorMessage(null);
    setTxHash(null);
    try {
      const { hash, tallies } = await castVote(address, index, setTxStatus);
      setTxHash(hash);
      setPoll((prev) => (prev ? { ...prev, tallies } : prev));
      setVoted(true);
    } catch (err) {
      setErrorMessage(classifyError(err).message);
      setTxStatus("error");
    } finally {
      setVoting(false);
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__brand-mark">FlipVote</span>
          <span className="app__brand-sub">live on-chain polling · Soroban testnet</span>
        </div>
        <ConnectWallet address={address} connecting={connecting} onConnect={handleConnect} onDisconnect={handleDisconnect} />
      </header>

      <TxStatusBanner status={txStatus} hash={txHash} errorMessage={txStatus === "error" ? errorMessage : null} />

      <main className="app__main">
        {!CONTRACT_ID && (
          <div className="callout callout--warn">
            No contract configured. Set <code>VITE_CONTRACT_ID</code> in <code>.env</code> after deploying (see README).
          </div>
        )}

        {!address && CONTRACT_ID && (
          <div className="callout">Connect a wallet to load the live poll and cast a vote.</div>
        )}

        {address && pollError && <div className="callout callout--error">{pollError}</div>}

        {address && !poll && !pollError && <div className="callout">Loading poll from the contract…</div>}

        {poll && (
          <PollBoard poll={poll} hasVoted={voted} voting={voting} connected={!!address} onVote={handleVote} />
        )}

        {errorMessage && txStatus !== "error" && <div className="callout callout--error">{errorMessage}</div>}
      </main>

      <footer className="app__footer">
        contract: <code>{CONTRACT_ID || "not deployed yet"}</code>
      </footer>
    </div>
  );
}
