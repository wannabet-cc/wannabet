import { Address } from "viem";
import { z } from "zod";

export const addressRegex = /^0x[a-fA-F0-9]{40}$/;
export const addressSchema = z
  .string()
  .trim()
  .refine((val) => addressRegex.test(val), { message: "Invalid ethereum address" })
  .transform((val) => val as Address);
