// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {BetFactory} from "./BetFactory.sol";

contract Bet {
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
    address private immutable _ARBITRATOR;
    uint256 private immutable _VALID_UNTIL;

    BetFactory private _betFactory;
    Status private _status = Status.Pending;
    bool private _fundsWithdrawn = false;
    address public winner;

    // -> Events
    event BetAccepted(address indexed factoryContract);
    event BetDeclined(address indexed factoryContract);
    event BetSettled(address indexed factoryContract, address indexed winner);

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

    modifier onlyArbitrator() {
        if (msg.sender != _ARBITRATOR) revert BET__Unauthorized();
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
        address _arbitrator,
        uint256 _validFor,
        address _factoryContract
    ) {
        _BET_ID = _betId;
        _CREATOR = _creator;
        _PARTICIPANT = _participant;
        _AMOUNT = _amount;
        _TOKEN = IERC20(_token);
        _MESSAGE = _message;
        _ARBITRATOR = _arbitrator;
        _VALID_UNTIL = block.timestamp + _validFor;
        _betFactory = BetFactory(_factoryContract);
    }

    function acceptBet() public payable onlyParticipant {
        if (msg.value < _betFactory.fee()) revert BET__FeeNotEnough();
        if (_isExpired()) revert BET__Expired();
        if (_status != Status.Pending) revert BET__InvalidStatus();

        // Transfer tokens to contract
        bool success = _TOKEN.transferFrom(msg.sender, address(this), _AMOUNT);
        if (!success) revert BET__FailedTransfer();

        // Send fee to factory contract owner
        (bool feeSuccess, ) = payable(_betFactory.owner()).call{
            value: msg.value
        }("");
        if (!feeSuccess) revert BET__FailedEthTransfer();

        // Update state variables
        _status = Status.Accepted;
        // Emit event
        emit BetAccepted(address(_betFactory));
    }

    function declineBet() public onlyParticipant {
        if (_isExpired()) revert BET__Expired();
        if (_status != Status.Pending) revert BET__InvalidStatus();

        // Return tokens to original party
        bool success = _TOKEN.transfer(_CREATOR, _AMOUNT);
        if (!success) revert BET__FailedTransfer();

        // Update state variables
        _status = Status.Declined;
        // Emit event
        emit BetDeclined(address(_betFactory));
    }

    function retrieveTokens() public onlyCreator {
        if (!_isExpired()) revert BET__Unauthorized();
        if (_fundsWithdrawn) revert BET__FundsAlreadyWithdrawn();

        // Return tokens to bet creator
        bool success = _TOKEN.transfer(_CREATOR, _AMOUNT);
        if (!success) revert BET__FailedTransfer();

        // Update state
        _fundsWithdrawn = true;
    }

    function settleBet(address _winner) public onlyArbitrator {
        if (_status != Status.Accepted) revert BET__InvalidStatus();
        if (
            _winner != _CREATOR &&
            _winner != _PARTICIPANT &&
            _winner != 0x0000000000000000000000000000000000000000
        ) revert BET__BadInput();

        // Transfer tokens to winner
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

        // Update state variables
        _status = Status.Settled;
        winner = _winner;
        // Emit event
        emit BetSettled(address(_betFactory), _winner);
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
            address arbitrator,
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
            _ARBITRATOR,
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
