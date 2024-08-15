import { Address } from "viem";

export type WannaBetUser = {
  type: "Address" | "ENS" | "NameStone";
  name: string;
  address: Address;
  avatar?: string;
  path: `/u/${string}`;
};
