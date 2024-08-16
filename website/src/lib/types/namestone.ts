import { z } from "zod";

export const nameStone_NameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(18)
  .regex(/^[a-z0-9]+$/, "Only alphanumeric characters are allowed");

export type TNameStoneName = z.infer<typeof nameStone_NameSchema>;
