// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {BetFactory} from "./BetFactory.sol";

contract Bet is ReentrancyGuard {
    // -> Type declarations
    enum Status {
        Pending,
        Declined,
        Accepted,
        Settled
    }

    // -> State variables
    uint256 private immutable _BET_ID;
    address private immutable _CREATOR;
    address private immutable _PARTICIPANT;
    uint256 private immutable _AMOUNT;
    IERC20 private immutable _TOKEN;
    string private _MESSAGE;
    address private immutable _JUDGE;
    uint256 private immutable _VALID_UNTIL;
    BetFactory private immutable _BET_FACTORY;

    Status private _status = Status.Pending;
    bool private _fundsWithdrawn = false;
    address public winner;

    // -> Events
    event BetAccepted();
    event BetDeclined();
    event BetSettled(address indexed winner);

    // -> Errors
    error BET__Unauthorized();
    error BET__Expired();
    error BET__InvalidStatus();
    error BET__FailedTransfer();
    error BET__FailedEthTransfer();
    error BET__FundsAlreadyWithdrawn();
    error BET__BadInput();
    error BET__FeeNotEnough();

    // -> Modifiers
    modifier onlyCreator() {
        if (msg.sender != _CREATOR) revert BET__Unauthorized();
        _;
    }

    modifier onlyParticipant() {
        if (msg.sender != _PARTICIPANT) revert BET__Unauthorized();
        _;
    }

    modifier onlyJudge() {
        if (msg.sender != _JUDGE) revert BET__Unauthorized();
        _;
    }

    // -> Functions
    constructor(
        uint256 _betId,
        address _creator,
        address _participant,
        uint256 _amount,
        address _token,
        string memory _message,
        address _judge,
        uint256 _validFor,
        address _factoryContract
    ) {
        _BET_ID = _betId;
        _CREATOR = _creator;
        _PARTICIPANT = _participant;
        _AMOUNT = _amount;
        _TOKEN = IERC20(_token);
        _MESSAGE = _message;
        _JUDGE = _judge;
        _VALID_UNTIL = block.timestamp + _validFor;
        _BET_FACTORY = BetFactory(_factoryContract);
    }

    function acceptBet() public payable onlyParticipant nonReentrant {
        // Checks
        if (msg.value < _BET_FACTORY.fee()) revert BET__FeeNotEnough();
        if (_isExpired()) revert BET__Expired();
        if (_status != Status.Pending) revert BET__InvalidStatus();

        // Update state
        _status = Status.Accepted;

        // Emit event
        emit BetAccepted();

        // Interactions: Token transfer
        bool success = _TOKEN.transferFrom(msg.sender, address(this), _AMOUNT);
        if (!success) revert BET__FailedTransfer();

        // Interactions: Send ETH fee
        (bool feeSuccess, ) = payable(_BET_FACTORY.owner()).call{
            value: msg.value
        }("");
        if (!feeSuccess) revert BET__FailedEthTransfer();
    }

    function declineBet() public onlyParticipant nonReentrant {
        // Checks
        if (_isExpired()) revert BET__Expired();
        if (_status != Status.Pending) revert BET__InvalidStatus();

        // Update state
        _status = Status.Declined;

        // Emit event
        emit BetDeclined();

        // Interactions: Token transfer
        bool success = _TOKEN.transfer(_CREATOR, _AMOUNT);
        if (!success) revert BET__FailedTransfer();
    }

    function retrieveTokens() public onlyCreator nonReentrant {
        // Checks
        if (!_isExpired()) revert BET__InvalidStatus();
        if (_fundsWithdrawn) revert BET__FundsAlreadyWithdrawn();

        // Update state
        _fundsWithdrawn = true;

        // Interactions: Token transfer
        bool success = _TOKEN.transfer(_CREATOR, _AMOUNT);
        if (!success) revert BET__FailedTransfer();
    }

    function settleBet(address _winner) public onlyJudge nonReentrant {
        // Checks
        if (_status != Status.Accepted) revert BET__InvalidStatus();
        if (
            _winner != _CREATOR &&
            _winner != _PARTICIPANT &&
            _winner != 0x0000000000000000000000000000000000000000
        ) revert BET__BadInput();

        // Update state
        _status = Status.Settled;
        winner = _winner;

        // Emit event
        emit BetSettled(_winner);

        // Interactions: Token transfer
        if (_winner == 0x0000000000000000000000000000000000000000) {
            // In tie event, the funds are returned
            bool success1 = _TOKEN.transfer(_CREATOR, _AMOUNT);
            bool success2 = _TOKEN.transfer(_PARTICIPANT, _AMOUNT);
            if (!success1 || !success2) revert BET__FailedTransfer();
        } else {
            // In winning event, all funds are transfered to the winner
            bool success = _TOKEN.transfer(_winner, _AMOUNT * 2);
            if (!success) revert BET__FailedTransfer();
        }
    }

    function betDetails()
        public
        view
        returns (
            uint256 betId,
            address creator,
            address participant,
            uint256 amount,
            IERC20 token,
            string memory message,
            address judge,
            uint256 validUntil
        )
    {
        return (
            _BET_ID,
            _CREATOR,
            _PARTICIPANT,
            _AMOUNT,
            _TOKEN,
            _MESSAGE,
            _JUDGE,
            _VALID_UNTIL
        );
    }

    function getStatus() public view returns (string memory) {
        if (_isExpired()) {
            return "expired";
        } else if (_status == Status.Pending) {
            return "pending";
        } else if (_status == Status.Declined) {
            return "declined";
        } else if (_status == Status.Accepted) {
            return "accepted";
        } else {
            return "settled";
        }
    }

    function _isExpired() private view returns (bool) {
        return block.timestamp >= _VALID_UNTIL && _status == Status.Pending;
    }
}
