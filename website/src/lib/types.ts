import { z } from "zod";
import type { Address } from "viem";

/** Token schemas & types */

export const ContractNameEnum = z.enum(["BetFactory"]);
export type ContractName = z.infer<typeof ContractNameEnum>;
export type Contract = {
  name: ContractName;
  address: Address;
};

export const TokenNameEnum = z.enum(["USDC", "WETH", "rETH", "JFF"]);
export type TokenName = z.infer<typeof TokenNameEnum>;
export type TokenContract = {
  name: TokenName;
  address: Address;
  decimals: number;
};

