# Wanna Bet

An onchain peer-to-peer betting tool. Whitepaper and development is currently in progress.

## How it works

There are two contracts: 
* `Bet.sol`, which is initiated with 6 parameters:
  1. `address` The bet creator
  2. `address` A participant
  3. `address` An arbitrator (one who selects the winner)
  4. `uint256` An token amount
  5. `string` An attached message
  6. `address` The erc20 token contract with which the bet is using
* `BetFactory.sol`, which creates new Bet contracts and holds the initial state of all bets created from it.

## Features

- [ ] Contract
  - [x] Build V1
  - [ ] Add acceptBet, declineBet, and settleBet functions to factory contract, given a contract address as a param
  - [ ] Etherscan auto-verification of created `Bet.sol` contracts
  - [ ] Add time as a function parameter to `Bet.sol` (e.g. after x days, if no accept or decline, cancel bet and return tokens to bet creator)
- [ ] Frame
  - [ ] Build V1
- [ ] Farcaster Bot
  - [ ] Build V1
