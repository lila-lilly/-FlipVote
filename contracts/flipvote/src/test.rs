#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, vec, Env};

fn setup(env: &Env) -> (FlipVoteContractClient, Address) {
    let contract_id = env.register(FlipVoteContract, ());
    let client = FlipVoteContractClient::new(env, &contract_id);
    let admin = Address::generate(env);
    (client, admin)
}

#[test]
fn test_initialize_and_get_poll() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, admin) = setup(&env);

    let question = String::from_str(&env, "Best Stellar wallet?");
    let options = vec![
        &env,
        String::from_str(&env, "Freighter"),
        String::from_str(&env, "xBull"),
        String::from_str(&env, "Lobstr"),
    ];

    client.initialize(&admin, &question, &options);

    let poll = client.get_poll();
    assert_eq!(poll.options.len(), 3);
    assert_eq!(poll.tallies, vec![&env, 0u32, 0u32, 0u32]);
    assert_eq!(poll.closed, false);
}

#[test]
#[should_panic(expected = "poll already initialized")]
fn test_double_initialize_panics() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, admin) = setup(&env);

    let q = String::from_str(&env, "Q");
    let opts = vec![&env, String::from_str(&env, "A"), String::from_str(&env, "B")];
    client.initialize(&admin, &q, &opts);
    client.initialize(&admin, &q, &opts);
}

#[test]
fn test_vote_increments_tally_and_blocks_double_vote() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, admin) = setup(&env);

    let q = String::from_str(&env, "Q");
    let opts = vec![&env, String::from_str(&env, "A"), String::from_str(&env, "B")];
    client.initialize(&admin, &q, &opts);

    let voter = Address::generate(&env);
    client.vote(&voter, &0u32);

    let results = client.get_results();
    assert_eq!(results, vec![&env, 1u32, 0u32]);
    assert!(client.has_voted(&voter));

    let result = client.try_vote(&voter, &1u32);
    assert!(result.is_err());
}

#[test]
fn test_close_poll_blocks_further_votes() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, admin) = setup(&env);

    let q = String::from_str(&env, "Q");
    let opts = vec![&env, String::from_str(&env, "A"), String::from_str(&env, "B")];
    client.initialize(&admin, &q, &opts);
    client.close_poll(&admin);

    let voter = Address::generate(&env);
    let result = client.try_vote(&voter, &0u32);
    assert!(result.is_err());
}

#[test]
fn test_invalid_option_index_rejected() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, admin) = setup(&env);

    let q = String::from_str(&env, "Q");
    let opts = vec![&env, String::from_str(&env, "A"), String::from_str(&env, "B")];
    client.initialize(&admin, &q, &opts);

    let voter = Address::generate(&env);
    let result = client.try_vote(&voter, &9u32);
    assert!(result.is_err());
}
