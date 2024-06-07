// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error Unauthorized();

contract Bet {
    uint256 public immutable BET_ID;
    address public immutable CREATOR;
    address public immutable PARTICIPANT;
    uint256 public immutable AMOUNT;
    IERC20 public immutable TOKEN;
    string public MESSAGE;
    address public immutable ARBITRATOR;
    uint256 public immutable VALID_UNTIL;

    enum Status {
        Pending,
        Declined,
        Accepted,
        Settled
    }
    Status private status = Status.Pending;

    bool private fundsWithdrawn = false;
    address public winner;

    constructor(
        uint256 _betId,
        address _creator,
        address _participant,
        uint256 _amount,
        address _token,
        string memory _message,
        address _arbitrator,
        uint256 _validFor
    ) {
        BET_ID = _betId;
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

    struct BetDetails {
        uint256 betId;
        address creator;
        address participant;
        uint256 amount;
        IERC20 token;
        string message;
        address arbitrator;
    }
    function getBetDetails() public view returns (BetDetails memory) {
        return
            BetDetails(
                BET_ID,
                CREATOR,
                PARTICIPANT,
                AMOUNT,
                TOKEN,
                MESSAGE,
                ARBITRATOR
            );
    }
    function isExpired() private view returns (bool) {
        return block.timestamp >= VALID_UNTIL && status == Status.Pending;
    }
    function getStatus() public view returns (string memory) {
        if (isExpired()) {
            return "expired";
        } else if (status == Status.Pending) {
            return "pending";
        } else if (status == Status.Declined) {
            return "declined";
        } else if (status == Status.Accepted) {
            return "accepted";
        } else {
            return "settled";
        }
    }

    function acceptBet() public onlyParticipant {
        require(!isExpired(), "Bet expired");
        require(status == Status.Pending, "Bet must be pending");
        require(
            AMOUNT <= IERC20(TOKEN).allowance(msg.sender, address(this)),
            "Must give approval to send tokens"
        );

        // Transfer tokens to contract
        bool success = TOKEN.transferFrom(msg.sender, address(this), AMOUNT);
        require(success, "Token transfer failed");
        // Update state variables
        status = Status.Accepted;
        // Emit event
        emit BetAccepted();
    }

    function declineBet() public onlyParticipant {
        require(!isExpired(), "Bet expired");
        require(status == Status.Pending, "Bet must be pending");

        // Return tokens to original party
        bool success = TOKEN.transfer(CREATOR, AMOUNT);
        require(success, "Token transfer failed");
        // Update state variables
        status = Status.Declined;
        // Emit event
        emit BetDeclined();
    }

    function retrieveTokens() public onlyCreator {
        require(isExpired(), "Bet must be expired");
        require(!fundsWithdrawn, "Funds already withdrawn");

        // Return tokens to bet creator
        bool success = TOKEN.transfer(CREATOR, AMOUNT);
        require(success, "Token transfer failed");
        // Update state
        fundsWithdrawn = true;
    }

    function settleBet(address _winner) public onlyArbitrator {
        require(status == Status.Accepted, "Bet must be accepted");
        require(
            _winner == CREATOR ||
                _winner == PARTICIPANT ||
                _winner == 0x0000000000000000000000000000000000000000,
            "Winner must be a betting party"
        );

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
        status = Status.Settled;
        winner = _winner;
        // Emit event
        emit BetSettled(_winner);
    }
}
