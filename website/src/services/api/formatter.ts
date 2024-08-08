import { BetAbi } from "@/abis/BetAbi";
import { getPreferredAlias, getPreferredAliases } from "../server-utils";
import { baseClient } from "../viem";
import type { RawBet } from "./queries";
import { formatUnits, type Address } from "viem";
import { baseContracts } from "@/lib";

// Formatted bet data types
type BetStatus = "expired" | "pending" | "accepted" | "declined" | "settled";
export type FormattedBet = {
  betId: number;
  contractAddress: Address;
  creator: Address;
  creatorAlias: string;
  creatorPfp?: string;
  participant: Address;
  participantAlias: string;
  participantPfp?: string;
  amount: number;
  bigintAmount: string;
  token: Address;
  message: string;
  judge: Address;
  judgeAlias: string;
  judgePfp?: string;
  validUntil: Date;
  createdTime: Date;
  status: BetStatus | undefined;
  winner: Address | undefined;
  judgementReason: string | undefined;
};
export type FormattedBets = {
  items: FormattedBet[];
  pageInfo?: {
    hasPreviousPage: boolean;
    startCursor: string;
    hasNextPage: false;
    endCursor: string;
  };
};

class BetFormatter {
  public async formatBet(rawBet: RawBet): Promise<FormattedBet> {
    console.log("Running formatBet...");
    try {
      // re-cast variables as the correct types
      const contractAddress = rawBet.contractAddress as Address,
        creator = rawBet.creator as Address,
        participant = rawBet.participant as Address,
        judge = rawBet.judge as Address;
      // get aliases and bet status
      const [creatorAlias, participantAlias, judgeAlias, status, winner, judgementReason] = await Promise.all([
        getPreferredAlias(creator),
        getPreferredAlias(participant),
        getPreferredAlias(judge),
        baseClient.readContract({
          address: contractAddress,
          abi: BetAbi,
          functionName: "getStatus",
        }),
        baseClient.readContract({
          address: contractAddress,
          abi: BetAbi,
          functionName: "winner",
        }),
        baseClient.readContract({
          address: contractAddress,
          abi: BetAbi,
          functionName: "judgementReason",
        }),
      ]);
      // return
      return {
        betId: Number(rawBet.id),
        contractAddress,
        creator,
        creatorAlias,
        participant,
        participantAlias,
        amount: Number(
          formatUnits(BigInt(rawBet.amount), baseContracts.getDecimalsFromAddress(rawBet.token as Address)),
        ),
        bigintAmount: rawBet.amount,
        token: rawBet.token as Address,
        message: rawBet.message,
        judge,
        judgeAlias,
        validUntil: new Date(Number(rawBet.validUntil) * 1000),
        createdTime: new Date(Number(rawBet.createdTime) * 1000),
        status: status as BetStatus,
        winner: winner,
        judgementReason: judgementReason,
      };
    } catch (error) {
      const errorMsg = "Failed to format bets from raw bets";
      console.error(errorMsg + ": " + error);
      throw new Error(errorMsg);
    }
  }

  public async formatBets(rawBets: RawBet[]): Promise<FormattedBet[]> {
    console.log("Running formatBets...");
    try {
      const preFormattedBets = await Promise.all(
        rawBets.map(async (rawBet) => {
          // re-cast variables as the correct types
          const contractAddress = rawBet.contractAddress as Address,
            creator = rawBet.creator as Address,
            participant = rawBet.participant as Address,
            judge = rawBet.judge as Address;
          // get aliases and bet status
          const [status, winner, judgementReason] = await Promise.all([
            baseClient.readContract({
              address: contractAddress,
              abi: BetAbi,
              functionName: "getStatus",
            }),
            baseClient.readContract({
              address: contractAddress,
              abi: BetAbi,
              functionName: "winner",
            }),
            baseClient.readContract({
              address: contractAddress,
              abi: BetAbi,
              functionName: "judgementReason",
            }),
          ]);
          // return
          return {
            betId: Number(rawBet.id),
            contractAddress,
            creator,
            participant,
            amount: Number(
              formatUnits(BigInt(rawBet.amount), baseContracts.getDecimalsFromAddress(rawBet.token as Address)),
            ),
            bigintAmount: rawBet.amount,
            token: rawBet.token as Address,
            message: rawBet.message,
            judge,
            validUntil: new Date(Number(rawBet.validUntil) * 1000),
            createdTime: new Date(Number(rawBet.createdTime) * 1000),
            status: status as BetStatus,
            winner: winner,
            judgementReason: judgementReason,
          };
        }),
      );
      const addressList = rawBets.map((bet) => [bet.creator, bet.participant, bet.judge]).flat() as Address[];
      const aliases = await getPreferredAliases(addressList);
      return preFormattedBets.map(
        (bet) =>
          ({
            ...bet,
            creatorAlias: aliases.get(bet.creator)?.alias,
            creatorPfp: aliases.get(bet.creator)?.pfp,
            participantAlias: aliases.get(bet.participant)?.alias,
            participantPfp: aliases.get(bet.participant)?.pfp,
            judgeAlias: aliases.get(bet.judge)?.alias,
            judgePfp: aliases.get(bet.judge)?.pfp,
          }) as FormattedBet,
      );
    } catch (error) {
      const errorMsg = "Failed to format bets from raw bets";
      console.error(errorMsg + ": " + error);
      throw new Error(errorMsg);
    }
  }
}

export { BetFormatter };
