import { Address, Hex } from "viem";
import { baseClient } from "./viem";
import { BetAbi } from "./contracts/BetAbi";
import {
  BET_ACCEPTED_EVENT_SIGNATURE,
  BET_CREATED_EVENT_SIGNATURE,
  BET_DECLINED_EVENT_SIGNATURE,
  BET_SETTLED_EVENT_SIGNATURE,
} from "./config";
import { neynarClient } from "./neynar";
import { BulkUserAddressTypes } from "@neynar/nodejs-sdk";

function abbreviateHex(hex: Hex, numChars: number = 3) {
  return `${hex.slice(0, numChars + 2)}...${hex.slice(numChars * -1)}`;
}

async function getFarcasterNames(addresses: Address[]) {
  const res = await neynarClient.fetchBulkUsersByEthereumAddress(addresses, {
    addressTypes: [BulkUserAddressTypes.VERIFIED_ADDRESS],
  });
  const farcasterNames = addresses.map(
    (address) =>
      res[address.toLowerCase()].reduce((prev, current) =>
        prev.follower_count >= current.follower_count ? prev : current
      ).username
  );
  return farcasterNames;
}

async function getBetDetails(betContractAddress: Address) {
  const [
    betId,
    creator,
    participant,
    amount,
    token,
    message,
    judge,
    validUntil,
  ] = await baseClient.readContract({
    address: betContractAddress,
    abi: BetAbi,
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
    judge,
    validUntil,
  };
}

async function getBetWinner(betContractAddress: Address) {
  const winner = await baseClient.readContract({
    address: betContractAddress,
    abi: BetAbi,
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
  abbreviateHex,
  getFarcasterNames,
  getBetDetails,
  getBetWinner,
  getEventNameFromSignature,
  sleep,
};
