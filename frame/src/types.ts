import { Env } from "frog";
import { Address } from "viem";

export type BetInfoState = Env & {
  participant: Address | string;
  arbitrator: Address | string;
  amount: number;
  message: string;
  validForDays: number;
};
