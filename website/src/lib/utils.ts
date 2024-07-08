import { BASE_USDC_ADDRESS } from "@/config";
import { type Address } from "viem";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Get a readable alias from a public address */
export async function getPreferredAlias(address: Address) {
  console.log("Running getPreferredAlias...");
  const ensName = (await fetchEns(address)).name;
  console.log(ensName);
  if (ensName) return ensName;
  else return abbreviateHex(address);
}

/** Abbreviate a hex address by replacing the middle with "..." */
export function abbreviateHex(hex: Address, numChars: number = 3) {
  return `${hex.slice(0, numChars + 2)}...${hex.slice(numChars * -1)}`;
}

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
