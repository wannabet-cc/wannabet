import { z } from "zod";
import { addressSchema } from "./address";
import { nameStone_NameSchema } from "./namestone";

export const api_limitSchema = z.number().int().positive().max(100);

export const api_setNameSchema = z.object({
  name: nameStone_NameSchema,
  address: addressSchema,
});
