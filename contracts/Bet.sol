// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Bet {
    address public immutable creator;
    address public immutable participant;
    address public immutable arbitrator;
    uint256 public immutable amount;
    string public message;
    bool public accepted = false;
    bool public settled = false;
    address public winner;

    IERC20 public immutable token;

    constructor(
        address _creator,
        address _participant,
        address _arbitrator,
        uint256 _amount,
        string memory _message,
        address _token
    ) {
        creator = _creator;
        participant = _participant;
        arbitrator = _arbitrator;
        amount = _amount;
        message = _message;
        token = IERC20(_token);
    }

    event BetAccepted();
    event BetDeclined();
    event BetSettled(address indexed winner);

    function acceptBet() public {
        require(
            msg.sender == participant,
            "Must be the participant to accept bet"
        );
        require(!accepted, "Bet has already been accepted");
        require(!settled, "Bet has already been settled");
        require(
            amount <= IERC20(token).allowance(msg.sender, address(this)),
            "Must give approval to send tokens"
        );

        // Transfer tokens to contract
        bool success = token.transferFrom(msg.sender, address(this), amount);
        require(success, "Token transfer failed");
        // Update state variables
        accepted = true;
        // Emit event
        emit BetAccepted();
    }

    function declineBet() public {
        require(
            msg.sender == participant,
            "Must be the participant to decline bet"
        );
        require(!accepted, "Bet has already been accepted");
        require(!settled, "Bet has already been settled");

        // Return tokens to original party
        bool success = token.transfer(creator, amount);
        require(success, "Token transfer failed");
        // Update state variables
        settled = true;
        // Emit event
        emit BetDeclined();
    }

    function settleBet(address _winner) public {
        require(msg.sender == arbitrator, "Must be arbitrator to settle bet");
        require(
            _winner == creator ||
                _winner == participant ||
                _winner == 0x0000000000000000000000000000000000000000,
            "Winner must be a betting party"
        );
        require(accepted, "Bet has not been accepted yet");
        require(!settled, "Bet has already been settled");

        // Transfer tokens to winner
        if (_winner == 0x0000000000000000000000000000000000000000) {
            // In tie event, the funds are returned
            bool success1 = token.transfer(creator, amount);
            require(success1, "Token transfer failed");
            bool success2 = token.transfer(participant, amount);
            require(success2, "Token transfer failed");
        } else {
            // In winning event, all funds are transfered to the winner
            bool success = token.transfer(_winner, amount * 2);
            require(success, "Token transfer failed");
        }

        // Update state variables
        winner = _winner;
        settled = true;
        // Emit event
        emit BetSettled(_winner);
    }
}
