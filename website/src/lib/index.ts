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

export async function fetchEns(nameOrAddress: `${string}.eth` | Address): Promise<EnsIdeasResponse> {
  const ensIdeasUrl = "https://api.ensideas.com/ens/resolve/";
  return fetch(ensIdeasUrl + nameOrAddress).then((res) => res.json());
}

export type EnsIdeasResponse = {
  address: Address;
  name: string;
  displayName: string;
  avatar: string;
};

type Chain = "base" | "arbitrum";
type TokenNames = "USDC" | "WETH" | "rETH" | "JFF" | "error";
type ContractName = "betFactory" | "usdc" | "weth" | "reth" | "jff";

type Contract = {
  name: ContractName;
  address: Address;
  chain: Chain;
};

type TokenContract = Contract & {
  decimals: number;
};

class Contracts {
  static #addresses: { [key in Chain]: { [key in ContractName]?: Address } } = {
    base: {
      betFactory: "0x304Ac36402D551fBba8e53E04e770337022e8757",
      usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      weth: "0x4200000000000000000000000000000000000006",
      reth: "0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c",
      jff: "0xC1C9046D6356c68b478092Fb907CD256EFc0dDa2",
    },
    arbitrum: {
      betFactory: "0xC1C9046D6356c68b478092Fb907CD256EFc0dDa2",
      usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      weth: "0x",
      reth: "0x",
    },
  };

  public static contractList: TokenNames[] = ["USDC", "WETH", "rETH", "JFF"];

  public static getAddress(chain: Chain, contractName: ContractName): Address | undefined {
    return this.#addresses[chain][contractName];
  }

  public static getTokenNameFromAddress(address: Address): TokenNames {
    if (address.toLowerCase() === this.getAddress("base", "usdc")!.toLowerCase()) return "USDC";
    if (address.toLowerCase() === this.getAddress("base", "weth")!.toLowerCase()) return "WETH";
    if (address.toLowerCase() === this.getAddress("base", "reth")!.toLowerCase()) return "rETH";
    else return "error";
  }

  public static getAddressFromTokenName(tokenName: TokenNames): Address {
    if (tokenName === "USDC") return this.getAddress("base", "usdc")!;
    if (tokenName === "WETH") return this.getAddress("base", "weth")!;
    if (tokenName === "rETH") return this.getAddress("base", "reth")!;
    else return "0x";
  }

  public static getDecimalsFromTokenName(tokenName: TokenNames): number {
    if (tokenName === "USDC") return 6;
    if (tokenName === "WETH" || tokenName === "rETH") return 18;
    else return 0;
  }

  public static getDecimalsFromTokenAddress(address: Address): number {
    if (address.toLowerCase() === this.getAddress("base", "usdc")!.toLowerCase()) return 6;
    if (
      address.toLowerCase() === this.getAddress("base", "weth")!.toLowerCase() ||
      address.toLowerCase() === this.getAddress("base", "reth")!.toLowerCase()
    )
      return 18;
    else return 0;
  }
}

export { Contracts };
