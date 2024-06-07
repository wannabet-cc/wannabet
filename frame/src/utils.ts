import { Address } from "viem";

function shortenHexAddress(address: Address) {
  return `${address.slice(0, 5)}...${address.slice(-3)}`;
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export { shortenHexAddress, capitalizeFirstLetter };
