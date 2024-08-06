import { Address } from "viem";

type Chain = "base" | "arbitrum";
type ContractName = "betFactory" | "usdc" | "weth" | "reth";

class Contracts {
  static #addresses: { [key in Chain]: { [key in ContractName]?: Address } } = {
    base: {
      betFactory: "0x304Ac36402D551fBba8e53E04e770337022e8757",
      usdc: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      weth: "0x4200000000000000000000000000000000000006",
      reth: "0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c",
    },
    arbitrum: {
      betFactory: "0xC1C9046D6356c68b478092Fb907CD256EFc0dDa2",
      usdc: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      weth: "0x",
      reth: "0x",
    },
  };

  public static getAddress(chain: Chain, contractName: ContractName): Address | undefined {
    return this.#addresses[chain][contractName];
  }
}

export { Contracts };

// Urls
export const BET_API_URL =
  process.env.BET_API_URL || "https://wanna-bet-production.up.railway.app/";
