import { BASE_USDC_ADDRESS } from "@/config";
import { type Address } from "viem";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Make a map from an array where the array values are the keys */
function arrayToMap<T>(arr: string[], value: T): Map<string, T> {
  return new Map(arr.map((key) => [key, value]));
}

/** Get the readable aliases from public addresses */
export async function getPreferredAliases(addresses: Address[]) {
  const aliasMap = arrayToMap<string>(addresses, "");
  const farcasterUsers = await fetchFarcasterUsers(addresses);
  for (const [address, user] of Object.entries(farcasterUsers)) {
    aliasMap.set(address, `@${user[0].username}`);
  }
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

/**
 * Get a readable alias from a public address
 * @deprecated
 */
export async function getPreferredAlias(address: Address): Promise<string> {
  const ensName = (await fetchEns(address)).name;
  if (ensName) return ensName;
  return abbreviateHex(address);
}

/** Get farcaster users from an array of addresses */
export async function fetchFarcasterUsers(addresses: Address[]) {
  const urlBase = "https://api.neynar.com/v2/farcaster/user/bulk-by-address";
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY || "",
    },
  };
  const data = (await fetch(
    `${urlBase}?addresses=${addresses.join("%2C")}`,
    options,
  ).then((res) => res.json())) as NeynarUserRes;
  return data;
}

type NeynarUserRes = {
  [key: string]: {
    object: string;
    fid: number;
    custody_address: Address;
    username: string;
    display_name: string;
    pfp_url: string;
    profile: {
      bio: {
        text: string;
      };
    };
    follower_count: number;
    following_count: number;
    verifications: Address[];
    verified_addresses: {
      eth_addresses: Address[];
      sol_addresses: Address[];
    };
    active_status: string;
    power_badge: boolean;
  }[];
};

/** Get ens data (address, name, & avatar url) from an address or ens name */
export async function fetchEns(
  nameOrAddress: `${string}.eth` | Address,
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

/** Abbreviate a hex address by replacing the middle with "..." */
export function abbreviateHex(hex: Address, numChars: number = 3) {
  return `${hex.slice(0, numChars + 2)}...${hex.slice(numChars * -1)}`;
}

/** Get a readable string name from the token contract address */
export function getTokenNameFromAddress(address: Address): string {
  if (address.toLowerCase() === BASE_USDC_ADDRESS.toLowerCase()) return "USDC";
  else return "error";
}

/** Get a token contract address from a readable name */
export function getAddressFromTokenName(tokenName: "USDC"): Address | string {
  if (tokenName === "USDC") return BASE_USDC_ADDRESS;
  else return "error";
}

/** Promise that resolves after a set number of seconds */
export function pause(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
