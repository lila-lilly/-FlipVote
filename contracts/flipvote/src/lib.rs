#![no_std]

//! FlipVote — a single-question, on-chain poll contract.
//!
//! Flow:
//! 1. `initialize` — the admin sets the question, 2-6 options, once.
//! 2. `vote`       — any address votes for one option, once. Emits a
//!                   `vote` event carrying the updated tallies so
//!                   frontends can render results in real time without
//!                   re-polling `get_poll` on every block.
//! 3. `close_poll` — admin can freeze the poll so no further votes count.

use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec};

#[derive(Clone)]
#[contracttype]
pub struct Poll {
    pub question: String,
    pub options: Vec<String>,
    pub tallies: Vec<u32>,
    pub admin: Address,
    pub closed: bool,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Poll,
    Voted(Address),
}

const VOTE_EVENT: Symbol = symbol_short!("vote");
const CLOSE_EVENT: Symbol = symbol_short!("closed");

// Persistent "has this address voted" flags are extended by this many
// ledgers (roughly 30 days on testnet) whenever they're touched, so a
// vote record doesn't silently expire and let someone vote twice.
const VOTED_TTL_EXTEND: u32 = 518_400; // ~30 days at 5s/ledger
const VOTED_TTL_THRESHOLD: u32 = 100_000;

#[contract]
pub struct FlipVoteContract;

#[contractimpl]
impl FlipVoteContract {
    /// Create the poll. Can only be called once per contract instance.
    pub fn initialize(env: Env, admin: Address, question: String, options: Vec<String>) {
        admin.require_auth();

        if env.storage().instance().has(&DataKey::Poll) {
            panic!("poll already initialized");
        }
        if options.len() < 2 || options.len() > 6 {
            panic!("a poll needs between 2 and 6 options");
        }

        let mut tallies: Vec<u32> = Vec::new(&env);
        for _ in 0..options.len() {
            tallies.push_back(0u32);
        }

        let poll = Poll {
            question,
            options,
            tallies,
            admin,
            closed: false,
        };

        env.storage().instance().set(&DataKey::Poll, &poll);
        env.storage().instance().extend_ttl(100_000, 518_400);
    }

    /// Cast one vote for `option_index`. Requires the voter's signature
    /// (`voter.require_auth()`), so the frontend must build this as a
    /// transaction the connected wallet signs — this is what makes the
    /// "call a contract from the frontend" + wallet-signing requirement
    /// tangible rather than simulated.
    pub fn vote(env: Env, voter: Address, option_index: u32) {
        voter.require_auth();

        let mut poll: Poll = env
            .storage()
            .instance()
            .get(&DataKey::Poll)
            .expect("poll not initialized");

        if poll.closed {
            panic!("poll is closed");
        }
        if option_index >= poll.options.len() {
            panic!("invalid option index");
        }

        let voted_key = DataKey::Voted(voter.clone());
        if env.storage().persistent().has(&voted_key) {
            panic!("this address has already voted");
        }

        let current = poll.tallies.get(option_index).unwrap();
        poll.tallies.set(option_index, current + 1);

        env.storage().instance().set(&DataKey::Poll, &poll);
        env.storage().persistent().set(&voted_key, &true);
        env.storage()
            .persistent()
            .extend_ttl(&voted_key, VOTED_TTL_THRESHOLD, VOTED_TTL_EXTEND);

        // Real-time sync: the frontend listens for this event (via
        // getEvents polling against Soroban RPC) instead of re-fetching
        // the whole poll on a timer.
        env.events()
            .publish((VOTE_EVENT, option_index), poll.tallies.clone());
    }

    /// Admin-only: freeze the poll so `vote` starts rejecting calls.
    pub fn close_poll(env: Env, admin: Address) {
        admin.require_auth();

        let mut poll: Poll = env
            .storage()
            .instance()
            .get(&DataKey::Poll)
            .expect("poll not initialized");

        if poll.admin != admin {
            panic!("only the poll admin can close it");
        }

        poll.closed = true;
        env.storage().instance().set(&DataKey::Poll, &poll);
        env.events().publish((CLOSE_EVENT,), true);
    }

    /// Read the full poll state (question, options, live tallies).
    pub fn get_poll(env: Env) -> Poll {
        env.storage()
            .instance()
            .get(&DataKey::Poll)
            .expect("poll not initialized")
    }

    /// Convenience read for just the tally vector.
    pub fn get_results(env: Env) -> Vec<u32> {
        let poll: Poll = env
            .storage()
            .instance()
            .get(&DataKey::Poll)
            .expect("poll not initialized");
        poll.tallies
    }

    /// Whether `voter` has already voted (used by the frontend to decide
    /// whether to show the ballot or the results view).
    pub fn has_voted(env: Env, voter: Address) -> bool {
        env.storage().persistent().has(&DataKey::Voted(voter))
    }
}

mod test;
