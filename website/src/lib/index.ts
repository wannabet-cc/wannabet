import { BASE_RETH_ADDRESS, BASE_USDC_ADDRESS, BASE_WETH_ADDRESS } from "@/config";
import { isAddress, type Address } from "viem";
import { abbreviateHex, arrayToMap } from "@/utils";

export async function getPreferredAliases(addresses: Address[]) {
  const aliasMap = arrayToMap<{ alias: string; pfp?: string }>(addresses, {
    alias: "",
    pfp: undefined,
  });
  const farcasterUsers = await fetchFarcasterUsers(addresses);
  for (const [address, users] of Object.entries(farcasterUsers)) {
    if (isAddress(address)) {
      const mostFollowedUser = users.reduce((mostFollowedUser, currentUser) =>
        mostFollowedUser.follower_count > currentUser.follower_count
          ? mostFollowedUser
          : currentUser,
      );
      aliasMap.set(address, {
        alias: `@${mostFollowedUser.username}`,
        pfp: mostFollowedUser.pfp_url,
      });
    }
  }
  for (const [address, alias] of aliasMap) {
    if (alias.alias === "") {
      const ensName = (await fetchEns(address as Address)).name;
      if (ensName) {
        aliasMap.set(address, { alias: ensName });
      } else {
        aliasMap.set(address, { alias: abbreviateHex(address as Address) });
      }
    }
  }
  return aliasMap;
}

export async function getPreferredAlias(address: Address): Promise<string> {
  const ensName = (await fetchEns(address)).name;
  if (ensName) return ensName;
  return abbreviateHex(address);
}

export async function fetchFarcasterUsers(addresses: Address[]) {
  const urlBase = "https://api.neynar.com/v2/farcaster/user/bulk-by-address";
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY || "",
    },
  };
  const data = (await fetch(`${urlBase}?addresses=${addresses.join("%2C")}`, options).then((res) =>
    res.json(),
  )) as NeynarUserRes;
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

export async function fetchEns(
  nameOrAddress: `${string}.eth` | Address,
): Promise<EnsIdeasResponse> {
  const ensIdeasUrl = "https://api.ensideas.com/ens/resolve/";
  return fetch(ensIdeasUrl + nameOrAddress).then((res) => res.json());
}

export type EnsIdeasResponse = {
  address: Address;
  name: string;
  displayName: string;
  avatar: string;
};

export function getTokenNameFromAddress(address: Address): TokenNames {
  if (address.toLowerCase() === BASE_USDC_ADDRESS.toLowerCase()) return "USDC";
  if (address.toLowerCase() === BASE_WETH_ADDRESS.toLowerCase()) return "WETH";
  if (address.toLowerCase() === BASE_RETH_ADDRESS.toLowerCase()) return "rETH";
  else return "error";
}

export function getAddressFromTokenName(tokenName: TokenNames): Address {
  if (tokenName === "USDC") return BASE_USDC_ADDRESS;
  if (tokenName === "WETH") return BASE_WETH_ADDRESS;
  if (tokenName === "rETH") return BASE_RETH_ADDRESS;
  else return "0x";
}

export function getDecimalsFromTokenName(tokenName: TokenNames): number {
  if (tokenName === "USDC") return 6;
  if (tokenName === "WETH" || tokenName === "rETH") return 18;
  else return 0;
}

export function getDecimalsFromTokenAddress(address: Address): number {
  if (address.toLowerCase() === BASE_USDC_ADDRESS.toLowerCase()) return 6;
  if (
    address.toLowerCase() === BASE_WETH_ADDRESS.toLowerCase() ||
    address.toLowerCase() === BASE_RETH_ADDRESS.toLowerCase()
  )
    return 18;
  else return 0;
}

type TokenNames = "USDC" | "WETH" | "rETH" | "error";
