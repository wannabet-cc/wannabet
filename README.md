# WannaBet

[WannaBet](https://wannabet.cc) is a public, onchain, peer-to-peer betting dapp [deployed on Base](https://basescan.org/address/0x304ac36402d551fbba8e53e04e770337022e8757). Bets are defined and placed upfront, wagers are held in an escrow contract, and a judge is assigned to determine a winner.

## Features

- Trustless, public wagers
- Bet with any ERC20 on Base (website currently only supports USDC)

## Current Deployments

- Contract (deployed on [base](https://basescan.org/address/0x304ac36402d551fbba8e53e04e770337022e8757))
- Web app (deployed at [wannabet.cc](https://wannabet.cc))
- Indexer & API (deployed)
- Bot (deployed on [farcaster](https://warpcast.com/wannabet))
- Frame (not production ready)

## How it works

There are 3 roles in any given bet: a creator, participant, and a judge. The bet creator and participant put their wagers into an escrow contract with the `createBet` and `acceptBet` functions respectively, and the judge determines the winner with the `settleBet` function.

1. Create a bet with BetFactory.sol `createBet`

- Sends your wager to the escrow contract (requires a preliminary authorization txn)
- Sends a fee
- Creates a new deployed instance of Bet.sol with a "pending" status

2. Accept, decline, or ignore a bet as the participant in Bet.sol

- `acceptBet`
  - Sends the participant's wager (requires a preliminary authorization txn)
  - Sends a fee
  - Changes the bet status to "accepted"
- `declineBet`
  - Returns the bet creator's wager
  - Changes the bet status to "declined"
- Ignore (if not accepted or declined prior to the specified deadline)
  - Changes the bet status to "expired"
  - Allows the bet creator to run `retrieveTokens` to get their wager back

3. If accepted, the judge can settle with `settleBet`

- Sends all tokens to the winning party
- Attaches a message as the judgement reasoning
- To settle as a tie, the judge can pass address(0) as the winner, and the tokens will be evenly returned to both parties
