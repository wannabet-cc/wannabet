import { z } from "zod";
import { ensOrAddressSchema } from "./ens";
import { addressSchema } from "./address";
import { TokenNameEnum } from "./tokens";

export const createBetFormSchema = z.object({
  participant: ensOrAddressSchema,
  participantAddress: addressSchema,
  amount: z.coerce.number().positive(),
  tokenName: TokenNameEnum,
  message: z.string(),
  validForDays: z.coerce.number().positive().lte(21),
  judge: ensOrAddressSchema,
  judgeAddress: addressSchema,
});

export type TCreateBetFormSchema = z.infer<typeof createBetFormSchema>;

export const createBetFormattedFormSchema = z.object({
  creator: addressSchema,
  participant: addressSchema,
  amount: z.bigint().positive(),
  token: addressSchema,
  message: z.string(),
  judge: addressSchema,
  validFor: z.bigint().positive(),
});

export type TCreateBetFormattedFormSchema = z.infer<typeof createBetFormattedFormSchema>;
