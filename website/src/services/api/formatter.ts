// Constants
import { BetAbi } from "@/abis/BetAbi";
// Functions & Clients
import { baseClient } from "../viem";
import { formatUnits } from "viem";
import { baseContracts } from "@/lib";
// Types
import type { Address } from "viem";
import type { RawBet, FormattedBet, BetStatus } from "./types";
import { UserResolver } from "@/lib/wb-user-resolver";

class BetFormatter {
  public async formatBet(rawBet: RawBet): Promise<FormattedBet> {
    console.log("Running formatBet...");
    try {
      // re-cast variables as the correct types
      const contractAddress = rawBet.contractAddress as Address,
        creatorAddress = rawBet.creator as Address,
        participantAddress = rawBet.participant as Address,
        judgeAddress = rawBet.judge as Address;
      // get aliases and bet status
      const [creator, participant, judge, status, winner, judgementReason] = await Promise.all([
        UserResolver.getPreferredUser(creatorAddress),
        UserResolver.getPreferredUser(participantAddress),
        UserResolver.getPreferredUser(judgeAddress),
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
      if (!creator || !participant || !judge) throw new Error(`Failed to get aliases for bet ${rawBet.id}`);
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
    } catch (error) {
      const errorMsg = "Failed to format bets from raw bets";
      console.error(errorMsg + ": " + error);
      throw new Error(errorMsg);
    }
  }

  public async formatBets(rawBets: RawBet[]): Promise<FormattedBet[]> {
    console.log("Running formatBets...");
    try {
      const formattedBets = await Promise.all(rawBets.map(async (rawBet) => this.formatBet(rawBet)));
      return formattedBets;
    } catch (error) {
      const errorMsg = "Failed to format bets from raw bets";
      console.error(errorMsg + ": " + error);
      throw new Error(errorMsg);
    }
  }
}

export { BetFormatter };
