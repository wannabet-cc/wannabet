// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error Unauthorized();

contract Bet {
    address public immutable CREATOR;
    address public immutable PARTICIPANT;
    uint256 public immutable AMOUNT;
    IERC20 public immutable TOKEN;
    string public MESSAGE;
    address public immutable ARBITRATOR;
    uint256 public immutable VALID_UNTIL;

    bool public accepted = false;
    bool public settled = false;
    address public winner;

    struct BetDetails {
        address creator;
        address participant;
        uint256 amount;
        IERC20 token;
        string message;
        address arbitrator;
        bool accepted;
        bool settled;
        address winner;
    }
    function getBetDetails() public view returns (BetDetails memory) {
        return
            BetDetails(
                CREATOR,
                PARTICIPANT,
                AMOUNT,
                TOKEN,
                MESSAGE,
                ARBITRATOR,
                accepted,
                settled,
                winner
            );
    }

    constructor(
        address _creator,
        address _participant,
        uint256 _amount,
        address _token,
        string memory _message,
        address _arbitrator,
        uint256 _validFor
    ) {
        CREATOR = _creator;
        PARTICIPANT = _participant;
        AMOUNT = _amount;
        TOKEN = IERC20(_token);
        MESSAGE = _message;
        ARBITRATOR = _arbitrator;
        VALID_UNTIL = block.timestamp + _validFor;
    }

    event BetAccepted();
    event BetDeclined();
    event BetSettled(address indexed winner);

    modifier onlyCreator() {
        if (msg.sender != CREATOR) {
            revert Unauthorized();
        }
        _;
    }
    modifier onlyParticipant() {
        if (msg.sender != PARTICIPANT) {
            revert Unauthorized();
        }
        _;
    }
    modifier onlyArbitrator() {
        if (msg.sender != ARBITRATOR) {
            revert Unauthorized();
        }
        _;
    }

    function isOfferExpired() public view returns (bool) {
        return block.timestamp >= VALID_UNTIL && (!accepted || !settled);
    }

    function isBetActive() public view returns (bool) {
        return !settled && !isOfferExpired();
    }

    function acceptBet() public onlyParticipant {
        require(!accepted, "Bet has already been accepted");
        require(!settled, "Bet has already been settled");
        require(!isOfferExpired(), "Bet expired");
        require(
            AMOUNT <= IERC20(TOKEN).allowance(msg.sender, address(this)),
            "Must give approval to send tokens"
        );

        // Transfer tokens to contract
        bool success = TOKEN.transferFrom(msg.sender, address(this), AMOUNT);
        require(success, "Token transfer failed");
        // Update state variables
        accepted = true;
        // Emit event
        emit BetAccepted();
    }

    function declineBet() public onlyParticipant {
        require(!accepted, "Bet has already been accepted");
        require(!settled, "Bet has already been settled");
        require(!isOfferExpired(), "Bet expired");

        // Return tokens to original party
        bool success = TOKEN.transfer(CREATOR, AMOUNT);
        require(success, "Token transfer failed");
        // Update state variables
        settled = true;
        // Emit event
        emit BetDeclined();
    }

    function retrieveTokens() public onlyCreator {
        require(!accepted, "Bet has already been accepted");
        require(!settled, "Bet has already been settled");
        require(isOfferExpired(), "Bet is still valid");

        // Return tokens to bet creator
        bool success = TOKEN.transfer(CREATOR, AMOUNT);
        require(success, "Token transfer failed");
        // Update state variables
        settled = true;
    }

    function settleBet(address _winner) public onlyArbitrator {
        require(
            _winner == CREATOR ||
                _winner == PARTICIPANT ||
                _winner == 0x0000000000000000000000000000000000000000,
            "Winner must be a betting party"
        );
        require(accepted, "Bet has not been accepted yet");
        require(!settled, "Bet has already been settled");

        // Transfer tokens to winner
        if (_winner == 0x0000000000000000000000000000000000000000) {
            // In tie event, the funds are returned
            bool success1 = TOKEN.transfer(CREATOR, AMOUNT);
            require(success1, "Token transfer failed");
            bool success2 = TOKEN.transfer(PARTICIPANT, AMOUNT);
            require(success2, "Token transfer failed");
        } else {
            // In winning event, all funds are transfered to the winner
            bool success = TOKEN.transfer(_winner, AMOUNT * 2);
            require(success, "Token transfer failed");
        }

        // Update state variables
        winner = _winner;
        settled = true;
        // Emit event
        emit BetSettled(_winner);
    }
}
