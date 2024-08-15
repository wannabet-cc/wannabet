import { WannaBetUser } from "@/lib/types/wb-user";
import { Address } from "viem";

type BetsWithPagination<T> = {
  items: T[];
  pageInfo?: {
    hasPreviousPage: boolean;
    startCursor: string;
    hasNextPage: false;
    endCursor: string;
  };
};

/** Raw bet types */

export type RawBet = {
  id: string;
  contractAddress: string;
  creator: string;
  participant: string;
  amount: string;
  token: string;
  message: string;
  judge: string;
  createdTime: string;
  validUntil: string;
};

export type RawBets = BetsWithPagination<RawBet>;

/** Formatted bet types */

export type BetStatus = "expired" | "pending" | "accepted" | "declined" | "settled";

export type FormattedBet = {
  betId: number;
  contractAddress: Address;
  creator: WannaBetUser;
  participant: WannaBetUser;
  amount: number;
  bigintAmount: string;
  token: Address;
  message: string;
  judge: WannaBetUser;
  validUntil: Date;
  createdTime: Date;
  status: BetStatus | undefined;
  winner: Address | undefined;
  judgementReason: string | undefined;
};

export type FormattedBets = BetsWithPagination<FormattedBet>;
