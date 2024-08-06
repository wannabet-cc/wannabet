import { formatUnits, type Hex } from "viem";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Function that formats bigints to a string, rounding to a specified number of decimals */
export function formatUSDC(value: bigint, decimals: number): string {
  const numberValue = formatUnits(value, 6);
  return `${numberValue.split(".")[0]}.${numberValue.split(".")[1].slice(0, decimals)}`;
}

/** Function that manually scrolls screen to an element id */
export function scrolltoHash(element_id: string) {
  const element = document.getElementById(element_id);
  element?.scrollIntoView({
    behavior: "smooth",
    block: "start",
    inline: "nearest",
  });
}

/** Round a float to a specified decimal place */
export function roundFloat(value: number, decimals: number) {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}

/** Make a map from an array where the array values are the keys */
export function arrayToMap<T>(arr: string[], value: T): Map<string, T> {
  return new Map(arr.map((key) => [key, value]));
}

/** Abbreviate a hex address by replacing the middle with "..." */
export function abbreviateHex(hex: Hex, numChars: number = 3) {
  return `${hex.slice(0, numChars + 2)}...${hex.slice(numChars * -1)}`;
}

/** Promise that resolves after a set number of seconds */
export function pause(seconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
