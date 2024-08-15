import { z } from "zod";

export const nameStone_NameSchema = z
  .string()
  .min(1)
  .max(18)
  .regex(/^[a-zA-Z0-9]+$/, "Only alphanumeric characters are allowed");
