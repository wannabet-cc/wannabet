import { BetAbi } from "@/abis/BetAbi";
import { config } from "@/app/providers";
import { BET_API_URL } from "@/config";
import { type Address, formatUnits } from "viem";
import {
  getDecimalsFromTokenAddress,
  getPreferredAlias,
  getPreferredAliases,
} from "@/lib/utils";
import { readContracts } from "@wagmi/core";
import {
  generateBetQuery,
  generateBetsQuery,
  generateRecentBetsQuery,
  generateUserBetsQuery,
} from "./queries";
import { baseClient } from "./viem";

/**
 * General graph ql data fetching function
 */

/** General function for fetching from a graphql API */
async function queryGqlApi<T>(url: string, query: string): Promise<T> {
  console.log("Running queryGqlApi...");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return res.json() as Promise<T>;
}

/**
 * Raw data fetching functions and types
 */

// Raw bet data types
type RawBet = {
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
type RawBets = {
  items: RawBet[];
  pageInfo?: {
    hasPreviousPage: boolean;
    startCursor: string;
    hasNextPage: false;
    endCursor: string;
  };
};

/** Raw data getter fn - single bet from an id */
type BetQueryResponse = { data: { bet: RawBet } };
export const getRawBetFromId = async (betId: number): Promise<RawBet> => {
  console.log("Running getRawBetFromId...");
  try {
    const query = generateBetQuery(betId);
    const result = await queryGqlApi<BetQueryResponse>(BET_API_URL, query);
    return result.data.bet;
  } catch (error) {
    const errorMsg = "Failed to get raw bet details from bet id";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};

/** Raw data getter fn - multiple bets from ids */
type BetsQueryResponse = { data: { bets: RawBets } };
export const getRawBetsFromIds = async (betIds: number[]): Promise<RawBets> => {
  console.log("Running getRawBetsFromIds...");
  try {
    const query = generateBetsQuery(betIds);
    const result = await queryGqlApi<BetsQueryResponse>(BET_API_URL, query);
    return result.data.bets;
  } catch (error) {
    const errorMsg = "Failed to get raw bets from bet ids";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};

/** Raw data getter fn - multiple bets, most recent */
export const getRecentRawBets = async (
  numBets: number,
  page?: Partial<{ afterCursor: string; beforeCursor: string }>,
): Promise<RawBets> => {
  console.log("Running getRecentRawBets...");
  try {
    const query = generateRecentBetsQuery(numBets, page);
    const result = await queryGqlApi<BetsQueryResponse>(BET_API_URL, query);
    return result.data.bets;
  } catch (error) {
    const errorMsg = "Failed to get recent raw bets";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};

/** Raw data getter fn - multiple bets from a user address, most recent  */
export const getUserRawBets = async (
  user: Address,
  numBets: number,
  page?: Partial<{ afterCursor: string; beforeCursor: string }>,
): Promise<RawBets> => {
  console.log("Running getRecentRawBets...");
  try {
    const query = generateUserBetsQuery(user, numBets, page);
    const result = await queryGqlApi<BetsQueryResponse>(BET_API_URL, query);
    return result.data.bets;
  } catch (error) {
    const errorMsg = "Failed to get raw bet details for a user";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};

/**
 * Data formatting functions and types
 */

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

/** Utility function for formatting a single bet */
export const formatBet = async (rawBet: RawBet): Promise<FormattedBet> => {
  console.log("Running formatBet...");
  try {
    // re-cast variables as the correct types
    const contractAddress = rawBet.contractAddress as Address,
      creator = rawBet.creator as Address,
      participant = rawBet.participant as Address,
      judge = rawBet.judge as Address;
    // get aliases and bet status
    const [
      creatorAlias,
      participantAlias,
      judgeAlias,
      status,
      winner,
      judgementReason,
    ] = await Promise.all([
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
        formatUnits(
          BigInt(rawBet.amount),
          getDecimalsFromTokenAddress(rawBet.token as Address),
        ),
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
};

/** Utility function for formatting multiple bets */
export const formatBets = async (
  rawBets: RawBet[],
): Promise<FormattedBet[]> => {
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
            formatUnits(
              BigInt(rawBet.amount),
              getDecimalsFromTokenAddress(rawBet.token as Address),
            ),
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
    const addressList = rawBets
      .map((bet) => [bet.creator, bet.participant, bet.judge])
      .flat() as Address[];
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
};

/**
 * Formatted data fetching functions and types
 */

/** Formatted data getter fn - single bet from an id */
export const getFormattedBetFromId = async (
  betId: number,
): Promise<FormattedBet> => {
  console.log("Running getFormattedBetFromId...");
  try {
    const rawBet = await getRawBetFromId(betId);
    return formatBet(rawBet);
  } catch (error) {
    const errorMsg = "Failed to get formatted bet details from bet id";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};

/** Formatted data getter fn - multiple bets from ids */
export const getFormattedBetsFromIds = async (
  betIds: number[],
): Promise<FormattedBets> => {
  console.log("Running getFormattedBetsFromIds...");
  try {
    const rawBets = await getRawBetsFromIds(betIds);
    const formattedBets = await formatBets(rawBets.items);
    return { items: formattedBets, pageInfo: rawBets.pageInfo };
  } catch (error) {
    const errorMsg = "Failed to get formatted bets from bet ids";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};

/** Formatted data getter fn - multiple bets, most recent */
export const getRecentFormattedBets = async (
  numBets: number,
  page?: Partial<{ afterCursor: string; beforeCursor: string }>,
): Promise<FormattedBets> => {
  console.log("Running getRecentFormattedBets...");
  try {
    const rawBets = await getRecentRawBets(numBets, page);
    const formattedBets = await formatBets(rawBets.items);
    return { items: formattedBets, pageInfo: rawBets.pageInfo };
  } catch (error) {
    const errorMsg = "Failed to get recent formatted bets";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};

/** Formatted data getter fn - multiple bets from a user address, most recent */
export const getUserFormattedBets = async (
  user: Address,
  numBets: number,
  page?: Partial<{ afterCursor: string; beforeCursor: string }>,
): Promise<FormattedBets> => {
  console.log("Running getUserFormattedBets...");
  try {
    const rawBets = await getUserRawBets(user, numBets, page);
    const formattedBets = await formatBets(rawBets.items);
    return { items: formattedBets, pageInfo: rawBets.pageInfo };
  } catch (error) {
    const errorMsg = "Failed to get formatted bet details for a user";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};
