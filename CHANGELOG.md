# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) ([github](https://github.com/olivierlacan/keep-a-changelog/tree/main))

## [0.4.0] - 2024-06-06

### Added

- Bet homepage
- Frame transactions for creating, accepting, declining, and settling a bet
- Frame transaction for authorizing a transfer of tokens to the bet contract
- Frame transaction for recovering your funds if a bet offer expires

## [0.3.0] - 2024-06-03

### Added

- Bet expiration contract logic
- Function for retrieving funds if the bet expires
- Function for checking if the bet is currently active
- Custom error for when attempting to run a function where you aren't the designated party

### Changed

- BetFactory state now has 3 main functions: one for getting contract addresses, one for getting a bet id from a contract address, and one for getting all bets related to a specific user
- Improve readability of some function requirements

### Removed

- Redundant state in BetFactory (i.e. bet creator, participant, amount, etc.)

## [0.2.0] - 2024-06-03

### Added

- Created a frame that...
  - takes essential user input required for creating a new bet
  - validates that input
  - allows users to authorize the bet factory contract to transfer the bet amount

## [0.1.0] - 2024-05-31

### Added

- Readme, license, and changelog
- Created `BetFactory.sol`... key features:
  - can read all bets based on chronological creation or based on user address'
  - can create new instances of `Bet.sol`
- Created `Bet.sol`... key features:
  - can read all relevant details of the bet, including the bet creator, participant, arbitrator, bet amount, attached message stating the bet terms, whether it has been accepted or settled yet, and if there is a winner, who it is
  - can accept or decline a bet as the bet participant
  - can settle a bet, selecting a winner or tie, as the bet arbitrator
