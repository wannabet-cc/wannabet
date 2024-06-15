import { Address, isAddress } from "viem";
import { z } from "zod";

// Ethereum schemas
const AddressSchema = z.custom<Address>(isAddress, "Invalid Address");
const EnsNameSchema = z.string().endsWith(".eth");

// Int schemas
const PositiveIntSchema = z.number().positive().int();
const CreatePageNumSchema = PositiveIntSchema.lte(8);
const BetIdSchema = PositiveIntSchema;
const BetAmountSchema = PositiveIntSchema.lte(
  5000,
  "For the moment, the max bet is $5k"
);
const DaysValidForSchema = PositiveIntSchema.lte(14);

export {
  AddressSchema,
  EnsNameSchema,
  CreatePageNumSchema,
  BetIdSchema,
  BetAmountSchema,
  DaysValidForSchema,
};
