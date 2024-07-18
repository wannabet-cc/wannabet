import { Address, Hex } from "viem";
import { baseClient } from "./viem";
import { BetAbi } from "./contracts/BetAbi";
import {
  BASE_RETH_ADDRESS,
  BASE_USDC_ADDRESS,
  BASE_WETH_ADDRESS,
  BET_ACCEPTED_EVENT_SIGNATURE,
  BET_CREATED_EVENT_SIGNATURE,
  BET_DECLINED_EVENT_SIGNATURE,
  BET_SETTLED_EVENT_SIGNATURE,
} from "./config";
import { neynarClient } from "./neynar";
import { BulkUserAddressTypes } from "@neynar/nodejs-sdk";

/** Abbreviate a hex address by replacing the middle with "..." */
function abbreviateHex(hex: Hex, numChars: number = 3) {
  return `${hex.slice(0, numChars + 2)}...${hex.slice(numChars * -1)}`;
}

/** Get ens data (address, name, & avatar url) from an address or ens name */
export async function fetchEns(
  nameOrAddress: `${string}.eth` | Address
): Promise<EnsIdeasResponse> {
  const ensIdeasUrl = "https://api.ensideas.com/ens/resolve/";
  return fetch(ensIdeasUrl + nameOrAddress).then((res) => res.json());
}

type EnsIdeasResponse = {
  address: Address;
  name: string;
  displayName: string;
  avatar: string;
};

/** Make a map from an array where the array values are the keys */
function arrayToMap<T>(arr: string[], value: T): Map<string, T> {
  return new Map(arr.map((key) => [key.toLowerCase(), value]));
}

/** Get a map of readable aliases from an array of public addresses */
export async function getPreferredAliasMap(
  addresses: Address[]
): Promise<Map<string, string>> {
  // -> Initialize map
  const aliasMap = arrayToMap<string>(addresses, "");
  // -> Get farcaster names
  const farcasterUsers = await neynarClient.fetchBulkUsersByEthereumAddress(
    addresses
  );
  console.log(farcasterUsers);
  // -> Map if available
  for (const [address, users] of Object.entries(farcasterUsers)) {
    const mostFollowedUser = users.reduce((prev, current) =>
      prev.follower_count >= current.follower_count ? prev : current
    );
    aliasMap.set(address, `@${mostFollowedUser.username}`);
  }
  // -> Set remaining names to ens names (if available) or abbreviated addresses if not
  for (const [address, alias] of aliasMap) {
    if (alias === "") {
      const ensName = (await fetchEns(address as Address)).name;
      if (ensName) {
        aliasMap.set(address, ensName);
      } else {
        aliasMap.set(address, abbreviateHex(address as Address));
      }
    }
  }
  return aliasMap;
}

export async function getPreferredAliases(
  addresses: Address[]
): Promise<string[]> {
  console.log(addresses);
  const aliasMap = await getPreferredAliasMap(addresses);
  console.log(aliasMap);
  return addresses.map(
    (address) => aliasMap.get(address.toLowerCase()) || "..."
  );
}

/** Fetch a list of farcaster usernames from a list of addresses */
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

/** Fetch WannaBet contract bet details from a contract address */
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

/** Fetch WannaBet contract bet winner from a contract address */
async function getBetWinner(betContractAddress: Address) {
  const winner = await baseClient.readContract({
    address: betContractAddress,
    abi: BetAbi,
    functionName: "winner",
  });
  return winner;
}

/** Get the readable event name from a WannaBet event signature */
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

/** Get a token contract address from a readable name */
export function getDecimalsFromTokenAddress(address: Address): number {
  if (address.toLowerCase() === BASE_USDC_ADDRESS.toLowerCase()) return 6;
  if (
    address.toLowerCase() === BASE_WETH_ADDRESS.toLowerCase() ||
    address.toLowerCase() === BASE_RETH_ADDRESS.toLowerCase()
  )
    return 18;
  else return 0;
}

/** Promise that resolves after a set number of seconds */
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
