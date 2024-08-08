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

/** General schemas & types */

export const addressRegex = /^0x[a-fA-F0-9]{40}$/;
export const addressSchema = z
  .string()
  .refine((val) => addressRegex.test(val), { message: "Invalid ethereum address" });

export const ensRegex = /^.{3,}\.eth$/;
export const ensSchema = z.string().refine((val) => ensRegex.test(val), { message: "Invalid ens name" });

export const ensOrAddressSchema = z.string().refine((val) => ensRegex.test(val) || addressRegex.test(val), {
  message: "Invalid ENS name or ethereum address",
});

/** Form schemas & types */

export const createBetFormSchema = z.object({
  participant: ensOrAddressSchema,
  amount: z.coerce.number().positive(),
  tokenName: TokenNameEnum,
  message: z.string(),
  validForDays: z.coerce.number().positive().lte(14),
  judge: ensOrAddressSchema,
});

export type TCreateBetFormSchema = z.infer<typeof createBetFormSchema>;
