// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Bet} from "contracts/Bet.sol";

contract BetFactory {
    uint256 public betCount = 0;
    // bet id -> contract address
    mapping(uint256 _betId => address contractAddress) public betAddresses;
    // contract address -> bet id
    mapping(address _contractAddress => uint256 betId) public betIds;
    // user address -> bet
    struct BetInfo {
        uint256 betId;
        address contractAddress;
        bool isCreator;
        bool isParticipant;
        bool isArbitrator;
    }
    mapping(address _userAddress => BetInfo[] betInfo) public userBets;

    function userBetCount(address _userAddress) public view returns (uint256) {
        return userBets[_userAddress].length;
    }

    constructor() {}

    event BetCreated(
        address indexed contractAddress,
        address indexed creator,
        address participant,
        uint256 indexed amount
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
                betCount + 1,
                msg.sender,
                _participant,
                _amount,
                _token,
                _message,
                _arbitrator,
                _validFor,
                address(this)
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
            betCount++;
            betAddresses[betCount] = address(newBet);
            betIds[address(newBet)] = betCount;
            userBets[msg.sender].push(
                BetInfo(
                    betCount,
                    address(newBet),
                    true,
                    false,
                    msg.sender == _arbitrator
                )
            );
            userBets[_participant].push(
                BetInfo(
                    betCount,
                    address(newBet),
                    false,
                    true,
                    _participant == _arbitrator
                )
            );
            if (_arbitrator != msg.sender && _arbitrator != _participant)
                userBets[_arbitrator].push(
                    BetInfo(betCount, address(newBet), false, false, true)
                );
            // Emit event
            emit BetCreated(address(newBet), msg.sender, _participant, _amount);
        } catch {
            revert("Deployment or token transfer failed");
        }
    }
}
