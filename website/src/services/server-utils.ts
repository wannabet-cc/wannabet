import { fetchEns } from "@/lib";
import { abbreviateHex } from "@/utils";
import { Address } from "viem";
import { NEYNAR_API_KEY } from "@/config/server";
import { nameStoneService } from "./namestone";

export async function getPreferredAlias(address: Address): Promise<string> {
  const nameStoneRes = await nameStoneService.getName(address);
  if (nameStoneRes) return nameStoneRes.name;

  const ensRes = await fetchEns(address);
  if (ensRes.name) return ensRes.name;

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
