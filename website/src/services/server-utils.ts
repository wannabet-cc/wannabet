import { fetchEns } from "@/lib";
import { abbreviateHex, arrayToMap } from "@/utils";
import { Address, isAddress } from "viem";
import { NEYNAR_API_KEY } from "@/config/server";

export async function getPreferredAliases(addresses: Address[]) {
  const aliasMap = arrayToMap<{ alias: string; pfp?: string }>(addresses, {
    alias: "",
    pfp: undefined,
  });
  const farcasterUsers = await fetchFarcasterUsers(addresses);
  for (const [address, users] of Object.entries(farcasterUsers)) {
    if (isAddress(address)) {
      const mostFollowedUser = users.reduce((mostFollowedUser, currentUser) =>
        mostFollowedUser.follower_count > currentUser.follower_count ? mostFollowedUser : currentUser,
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
      api_key: NEYNAR_API_KEY,
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
