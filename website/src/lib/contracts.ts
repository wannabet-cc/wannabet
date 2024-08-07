import { Address } from "viem";

type ContractName = "BetFactory";
type Contract = {
  name: ContractName;
  address: Address;
};

type TokenName = "USDC" | "WETH" | "rETH" | "JFF";
type TokenContract = {
  name: TokenName;
  address: Address;
  decimals: number;
};

class Contracts {
  #contracts: (Contract | TokenContract)[];

  constructor(contracts: (Contract | TokenContract)[]) {
    this.#contracts = contracts;
  }

  public getDecimalsFromName(name: TokenName): number {
    const contract = this.#contracts.find((c) => c.name === name && "decimals" in c) as TokenContract | undefined;
    if (!contract) throw new Error("Error finding token");
    return contract.decimals;
  }

  public getDecimalsFromAddress(address: Address): number {
    const contract = this.#contracts.find((c) => c.address === address && "decimals" in c) as TokenContract | undefined;
    if (!contract) throw new Error("Error finding token");
    return contract.decimals;
  }

  public getNameFromAddress(address: Address): ContractName | TokenName {
    const contract = this.#contracts.find((c) => c.address === address);
    if (!contract) throw new Error("Error finding token");
    return contract.name;
  }

  public getAddressFromName(name: ContractName | TokenName): Address {
    const contract = this.#contracts.find((c) => c.name === name);
    if (!contract) throw new Error("Error finding token");
    return contract.address;
  }
}

export const baseContracts = new Contracts([
  { name: "BetFactory", address: "0x304Ac36402D551fBba8e53E04e770337022e8757" },
  { name: "USDC", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
  { name: "WETH", address: "0x4200000000000000000000000000000000000006", decimals: 18 },
  { name: "rETH", address: "0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c", decimals: 18 },
  { name: "JFF", address: "0xC1C9046D6356c68b478092Fb907CD256EFc0dDa2", decimals: 18 },
]);

export const arbitrumContracts = new Contracts([
  { name: "BetFactory", address: "0xC1C9046D6356c68b478092Fb907CD256EFc0dDa2" },
  { name: "USDC", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6 },
]);
