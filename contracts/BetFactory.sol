// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Bet} from "contracts/Bet.sol";

contract BetFactory {
    struct BetDetails {
        address contractAddress;
        address creator;
        address participant;
        address arbitrator;
        uint256 amount;
        string message;
    }
    BetDetails[] public bets;

    mapping(address => BetDetails[]) public betsAsCreator;
    mapping(address => BetDetails[]) public betsAsParticipant;
    mapping(address => BetDetails[]) public betsAsArbitrator;

    constructor() {}

    event BetCreated(
        address contractAddress,
        address indexed creator,
        address indexed participant,
        address indexed arbitrator,
        uint256 amount,
        string message
    );

    function createBet(
        address _participant,
        uint256 _amount,
        address _token,
        string memory _message,
        address _arbitrator,
        uint256 _validFor
    ) public {
        require(msg.sender != _participant, "Cannot bet against yourself");
        require(_amount > 0, "Bet amount must be greater than 0");
        require(_validFor >= 3600, "Bet must be valid for at least 1 hour");
        require(
            _amount <= IERC20(_token).allowance(msg.sender, address(this)),
            "Must give approval to send tokens"
        );

        try
            new Bet(
                msg.sender,
                _participant,
                _amount,
                _token,
                _message,
                _arbitrator,
                _validFor
            )
        returns (Bet newBet) {
            // Transfer tokens to new contract
            bool success = IERC20(_token).transferFrom(
                msg.sender,
                address(newBet),
                _amount
            );
            require(success, "Token transfer failed");
            // Update state variables
            BetDetails memory bet = BetDetails(
                address(newBet),
                msg.sender,
                _participant,
                _arbitrator,
                _amount,
                _message
            );
            bets.push(bet);
            betsAsCreator[msg.sender].push(bet);
            betsAsParticipant[_participant].push(bet);
            betsAsArbitrator[_arbitrator].push(bet);
            // Emit event
            emit BetCreated(
                address(newBet),
                msg.sender,
                _participant,
                _arbitrator,
                _amount,
                _message
            );
        } catch {
            revert("Deployment or token transfer failed");
        }
    }
}
