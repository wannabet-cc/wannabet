import { z } from "zod";
import { addressSchema } from "./address";

export const api_limitSchema = z.number().int().positive().max(100);

export const api_nameSchema = z
  .string()
  .min(1)
  .max(18)
  .regex(/^[a-zA-Z0-9]+$/, "Only alphanumeric characters are allowed");

export const api_setNameSchema = z.object({
  name: api_nameSchema,
  address: addressSchema,
});
