import { Address } from "viem";

function shortenHexAddress(address: Address) {
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
}

export { shortenHexAddress };
