import { USDC_CONTRACT_ADDRESS } from "@/config";
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

export function getTokenNameFromAddress(address: Address): string {
  if (address.toLowerCase() === USDC_CONTRACT_ADDRESS.toLowerCase())
    return "USDC";
  else return "error";
}
export function getAddressFromTokenName(tokenName: "USDC"): Address | string {
  if (tokenName === "USDC") return USDC_CONTRACT_ADDRESS;
  else return "error";
}
