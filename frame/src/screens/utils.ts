import { Address } from "viem";

function isInt(value: number) {
  return value % 1 === 0;
}

function isIntInRange(value: number, low: number, high: number) {
  const isAboveLow = value >= low;
  const isBelowHigh = value <= high;
  return isInt(value) && isAboveLow && isBelowHigh;
}

function shortenHexAddress(address: Address) {
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
}

export { isInt, isIntInRange, shortenHexAddress };
