import { FlapRow } from "./FlapRow";
import { PollState } from "../lib/contract";

interface PollBoardProps {
  poll: PollState;
  hasVoted: boolean;
  voting: boolean;
  connected: boolean;
  onVote: (index: number) => void;
}

export function PollBoard({ poll, hasVoted, voting, connected, onVote }: PollBoardProps) {
  const total = poll.tallies.reduce((a, b) => a + b, 0);

  return (
    <div className="board">
      <div className="board__marquee">
        <span className="board__eyebrow">now showing</span>
        <h1 className="board__question">{poll.question}</h1>
        {poll.closed && <span className="board__closed">polling closed</span>}
      </div>

      <div className="board__rows">
        {poll.options.map((option, i) => {
          const count = poll.tallies[i] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div className="board__row" key={i}>
              <div className="board__option-label">{option}</div>
              <div className="board__bar-track">
                <div className="board__bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <FlapRow value={String(count)} minWidth={3} />
              <button
                className="board__vote-btn"
                disabled={!connected || hasVoted || poll.closed || voting}
                onClick={() => onVote(i)}
              >
                {hasVoted ? "voted" : voting ? "…" : "vote"}
              </button>
            </div>
          );
        })}
      </div>

      <div className="board__footer">
        <span>{total} total {total === 1 ? "vote" : "votes"} recorded on testnet</span>
      </div>
    </div>
  );
}
