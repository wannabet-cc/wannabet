import { Address } from "viem";
import { normalize } from "viem/ens";
import { arbitrumClientFn, mainnetClientFn } from "./viem";
import { type CustomEnvVars } from "./types";
import { betAbi } from "./contracts/betAbi";

function shortenHexAddress(address: Address) {
  return `${address.slice(0, 5)}...${address.slice(-3)}`;
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function convertTimestampToFormattedDate(timestamp: number): string {
  const date = new Date(timestamp * 1000); // Convert to milliseconds
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

async function getPreferredAlias(env: CustomEnvVars, address: Address) {
  let preferredAlias: string;
  const ensName = await mainnetClientFn(env).getEnsName({
    address,
  });
  if (ensName) {
    // <- most preferred: ens name
    preferredAlias = ensName;
  } else {
    // <- 2nd most preferred: shortened address
    preferredAlias = shortenHexAddress(address);
  }
  return preferredAlias;
}

async function getPreferredAliasAndPfp(env: CustomEnvVars, address: Address) {
  // Set preferred name
  let preferredAlias: string;
  const ensName = await mainnetClientFn(env).getEnsName({
    address,
  });
  if (ensName) {
    // <- most preferred: ens name
    preferredAlias = ensName;
  } else {
    // <- 2nd most preferred: shortened address
    preferredAlias = shortenHexAddress(address);
  }
  // Set preferred avatar
  let preferredPfpUrl: string;
  const ensAvatar = await mainnetClientFn(env).getEnsAvatar({
    name: normalize(ensName || ""),
  });
  if (ensAvatar) {
    // <- most preferred: ens avatar
    preferredPfpUrl = ensAvatar;
  } else {
    // <- 2nd most preferred: ens missing avatar
    preferredPfpUrl = "";
  }
  return { preferredAlias, preferredPfpUrl };
}

async function getBetDetails(env: CustomEnvVars, betContractAddress: Address) {
  const [
    betId,
    creator,
    participant,
    amount,
    token,
    message,
    arbitrator,
    validUntil,
  ] = await arbitrumClientFn(env).readContract({
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

async function fetchUser(apiKey: string, fid: number) {
  const url = `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`;
  const options = {
    method: "GET",
    headers: { accept: "application/json", api_key: apiKey },
  };

  return (await fetch(url, options).then((res) => res.json())) as UserData;
}
type UserData = {
  users: {
    object: string;
    fid: number;
    custody_address: Address;
    username: string;
    display_name: string | null;
    pfp_url: string | null;
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

export {
  shortenHexAddress,
  capitalizeFirstLetter,
  convertTimestampToFormattedDate,
  getPreferredAlias,
  getPreferredAliasAndPfp,
  getBetDetails,
  fetchUser,
};
