import { Address } from "viem";
import { arbitrumClient } from "./viem";
import { betAbi } from "./contracts/betAbi";
import {
  BET_ACCEPTED_EVENT_SIGNATURE,
  BET_CREATED_EVENT_SIGNATURE,
  BET_DECLINED_EVENT_SIGNATURE,
  BET_SETTLED_EVENT_SIGNATURE,
} from "./config";

function shortenHexAddress(address: Address) {
  return `${address.slice(0, 5)}...${address.slice(-3)}`;
}

async function getBetDetails(betContractAddress: Address) {
  const [
    betId,
    creator,
    participant,
    amount,
    token,
    message,
    arbitrator,
    validUntil,
  ] = await arbitrumClient.readContract({
    address: betContractAddress,
    abi: betAbi,
    functionName: "betDetails",
    args: [],
  });
  return {
    betId,
    creator,
    participant,
    amount,
    token,
    message,
    arbitrator,
    validUntil,
  };
}

async function getBetWinner(betContractAddress: Address) {
  const winner = await arbitrumClient.readContract({
    address: betContractAddress,
    abi: betAbi,
    functionName: "winner",
  });
  return winner;
}

function getEventNameFromSignature(eventSignature: string) {
  if (eventSignature === BET_CREATED_EVENT_SIGNATURE) {
    return "BetCreated";
  } else if (eventSignature === BET_ACCEPTED_EVENT_SIGNATURE) {
    return "BetAccepted";
  } else if (eventSignature === BET_DECLINED_EVENT_SIGNATURE) {
    return "BetDeclined";
  } else if (eventSignature === BET_SETTLED_EVENT_SIGNATURE) {
    return "BetSettled";
  } else {
    return null;
  }
}

async function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export {
  shortenHexAddress,
  getBetDetails,
  getBetWinner,
  getEventNameFromSignature,
  sleep,
};
