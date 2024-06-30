// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Bet} from "contracts/Bet.sol";

contract BetFactory {
    // -> Type declarations
    struct BetInfo {
        uint256 betId;
        address contractAddress;
        bool isCreator;
        bool isParticipant;
        bool isJudge;
    }

    // -> State variables
    address public owner;
    uint256 public fee;
    uint256 public betCount = 0;
    mapping(uint256 _betId => address contractAddress) public betAddresses;
    mapping(address _contractAddress => uint256 betId) public betIds;
    mapping(address _userAddress => BetInfo[] betInfo) public userBets;

    // -> Events
    event BetCreated(
        address indexed contractAddress,
        address indexed creator,
        address participant,
        uint256 indexed amount
    );

    // -> Errors
    error BET__Unauthorized();
    error BET__FeeNotEnough();
    error BET__FailedTokenTransfer();
    error BET__FailedEthTransfer();
    error BET__BadInput();

    // -> Modifiers
    modifier onlyOwner() {
        if (owner != msg.sender) revert BET__Unauthorized();
        _;
    }

    // -> Functions
    constructor(uint256 _initialFee) {
        owner = msg.sender;
        fee = _initialFee;
    }

    function transferOwnership(address _newOwner) public virtual onlyOwner {
        owner = _newOwner;
    }

    function changeFee(uint256 _newFee) public virtual onlyOwner {
        fee = _newFee;
    }

    function createBet(
        address _participant,
        uint256 _amount,
        address _token,
        string memory _message,
        address _judge,
        uint256 _validFor
    ) public payable {
        if (msg.value < fee) revert BET__FeeNotEnough();
        if (msg.sender == _participant) revert BET__BadInput();
        if (_amount <= 0) revert BET__BadInput();
        if (_validFor < 3600) revert("Bet must be valid for at least 1 hour");

        try
            new Bet(
                betCount + 1,
                msg.sender,
                _participant,
                _amount,
                _token,
                _message,
                _judge,
                _validFor,
                address(this)
            )
        returns (Bet newBet) {
            // Transfer tokens to new contract
            bool tokenSuccess = IERC20(_token).transferFrom(
                msg.sender,
                address(newBet),
                _amount
            );
            if (!tokenSuccess) revert BET__FailedTokenTransfer();

            // Send fee to owner
            (bool feeSuccess, ) = payable(owner).call{value: msg.value}("");
            if (!feeSuccess) revert BET__FailedEthTransfer();

            // Update state variables
            betCount++;
            betAddresses[betCount] = address(newBet);
            betIds[address(newBet)] = betCount;
            userBets[msg.sender].push(
                BetInfo(
                    betCount,
                    address(newBet),
                    true,
                    false,
                    msg.sender == _judge
                )
            );
            userBets[_participant].push(
                BetInfo(
                    betCount,
                    address(newBet),
                    false,
                    true,
                    _participant == _judge
                )
            );
            if (_judge != msg.sender && _judge != _participant)
                userBets[_judge].push(
                    BetInfo(betCount, address(newBet), false, false, true)
                );
            // Emit event
            emit BetCreated(address(newBet), msg.sender, _participant, _amount);
        } catch {
            revert("Deployment or token transfer failed");
        }
    }

    function userBetCount(address _userAddress) public view returns (uint256) {
        return userBets[_userAddress].length;
    }
}
