import { BASE_USDC_ADDRESS } from "@/config";
import { mainnetClient } from "@/services/viem";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Address } from "viem";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function getPreferredAlias(address: Address) {
  console.log("Running getPreferredAlias...");
  const ensName = await mainnetClient.getEnsName({
    address,
  });
  console.log(ensName);
  if (ensName) return ensName;
  else return abbreviateHex(address);
}

export function abbreviateHex(hex: Address) {
  return `${hex.slice(0, 5)}...${hex.slice(-3)}`;
}

type EnsIdeasResponse = {
  address: Address;
  name: string;
  displayName: string;
  avatar: string;
};
export async function fetchEnsAddress(ensName: string) {
  const ensIdeasUrl = "https://api.ensideas.com/ens/resolve/";
  return (await fetch(ensIdeasUrl + ensName).then((res) =>
    res.json(),
  )) as EnsIdeasResponse;
}

export function getTokenNameFromAddress(address: Address): string {
  if (address.toLowerCase() === BASE_USDC_ADDRESS.toLowerCase()) return "USDC";
  else return "error";
}
export function getAddressFromTokenName(tokenName: "USDC"): Address | string {
  if (tokenName === "USDC") return BASE_USDC_ADDRESS;
  else return "error";
}
