import { BASE_USDC_ADDRESS } from "@/config";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Address } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getPreferredAlias(address: Address) {
  console.log("Running getPreferredAlias...");
  const ensName = (await fetchEns(address)).name;
  console.log(ensName);
  if (ensName) return ensName;
  else return abbreviateHex(address);
}

export function abbreviateHex(hex: Address, numChars: number = 3) {
  return `${hex.slice(0, numChars + 2)}...${hex.slice(numChars * -1)}`;
}

type EnsIdeasResponse = {
  address: Address;
  name: string;
  displayName: string;
  avatar: string;
};
export async function fetchEns(
  nameOrAddress: `${string}.eth` | Address,
): Promise<EnsIdeasResponse> {
  const ensIdeasUrl = "https://api.ensideas.com/ens/resolve/";
  return fetch(ensIdeasUrl + nameOrAddress).then((res) => res.json());
}

export function getTokenNameFromAddress(address: Address): string {
  if (address.toLowerCase() === BASE_USDC_ADDRESS.toLowerCase()) return "USDC";
  else return "error";
}
export function getAddressFromTokenName(tokenName: "USDC"): Address | string {
  if (tokenName === "USDC") return BASE_USDC_ADDRESS;
  else return "error";
}

export function pause(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
