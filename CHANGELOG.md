# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) ([github](https://github.com/olivierlacan/keep-a-changelog/tree/main))

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
