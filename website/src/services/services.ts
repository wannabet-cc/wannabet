import { Address, formatUnits } from "viem";
import { arbitrumClient } from "./viem";
import { BET_API_URL } from "@/config";
import { BetAbi } from "@/abis/BetAbi";
import { getPreferredAlias } from "@/lib/utils";
import {
  generateBetQuery,
  generateBetsQuery,
  generateRecentBetsQuery,
  generateUserBetsQuery,
} from "./queries";

// General getter function
async function queryGqlApi<T>(url: string, query: string): Promise<T> {
  console.log("Running queryGqlApi...");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return res.json() as Promise<T>;
}

// Raw data types
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

// Get raw data
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
type BetsQueryResponse = { data: { bets: RawBets } };
export const getRawBetsFromIds = async (betIds: number[]): Promise<RawBets> => {
  console.log("Running getRawBetsFromIds...");
  try {
    const query = generateBetsQuery(betIds);
    const result = await queryGqlApi<BetsQueryResponse>(BET_API_URL, query);
    return result.data.bets;
  } catch (error) {
    const errorMsg = "Failed to get raw bet details from bet id";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};
export const getRecentRawBets = async (numBets: number): Promise<RawBets> => {
  console.log("Running getRecentRawBets...");
  try {
    const query = generateRecentBetsQuery(numBets);
    const result = await queryGqlApi<BetsQueryResponse>(BET_API_URL, query);
    return result.data.bets;
  } catch (error) {
    const errorMsg = "Failed to get raw bet details from bet id";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};
export const getUserRawBets = async (
  user: Address,
  numBets: number,
): Promise<RawBets> => {
  console.log("Running getRecentRawBets...");
  try {
    const query = generateUserBetsQuery(user, numBets);
    const result = await queryGqlApi<BetsQueryResponse>(BET_API_URL, query);
    return result.data.bets;
  } catch (error) {
    const errorMsg = "Failed to get raw bet details from bet id";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};

// Formatted data types
type BetStatus = "expired" | "pending" | "accepted" | "declined" | "settled";
export type FormattedBet = {
  betId: number;
  contractAddress: Address;
  creator: Address;
  creatorAlias: string;
  participant: Address;
  participantAlias: string;
  amount: number;
  token: Address;
  message: string;
  judge: Address;
  judgeAlias: string;
  validUntil: Date;
  createdTime: Date;
  status: BetStatus;
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

// Utility function for formatting a bet
export const formatBet = async (rawBet: RawBet): Promise<FormattedBet> => {
  console.log("Running formatBet...");
  try {
    // re-cast variables as the correct types
    const contractAddress = rawBet.contractAddress as Address,
      creator = rawBet.creator as Address,
      participant = rawBet.participant as Address,
      judge = rawBet.judge as Address;
    // get aliases and bet status
    const [creatorAlias, participantAlias, judgeAlias, status] =
      await Promise.all([
        getPreferredAlias(creator),
        getPreferredAlias(participant),
        getPreferredAlias(judge),
        arbitrumClient.readContract({
          address: contractAddress,
          abi: BetAbi,
          functionName: "getStatus",
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
      amount: Number(formatUnits(BigInt(rawBet.amount), 6)),
      token: rawBet.token as Address,
      message: rawBet.message,
      judge,
      judgeAlias,
      validUntil: new Date(Number(rawBet.validUntil) * 1000),
      createdTime: new Date(Number(rawBet.createdTime) * 1000),
      status: status as BetStatus,
    };
  } catch (error) {
    const errorMsg = "Failed to format bets from raw bets";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};

// Get formatted data
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
export const getFormattedBetsFromIds = async (
  betIds: number[],
): Promise<FormattedBets> => {
  console.log("Running getFormattedBetsFromIds...");
  try {
    const rawBets = await getRawBetsFromIds(betIds);
    const formattedBets = await Promise.all(
      rawBets.items.map((bet) => formatBet(bet)),
    );
    return { items: formattedBets };
  } catch (error) {
    const errorMsg = "Failed to get formatted bet details from bet ids";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};
export const getRecentFormattedBets = async (
  numBets: number,
): Promise<FormattedBets> => {
  console.log("Running getRecentFormattedBets...");
  try {
    const rawBets = await getRecentRawBets(numBets);
    const formattedBets = await Promise.all(
      rawBets.items.map((bet) => formatBet(bet)),
    );
    return { items: formattedBets };
  } catch (error) {
    const errorMsg = "Failed to get formatted bet details from bet ids";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};
export const getUserFormattedBets = async (
  user: Address,
  numBets: number,
): Promise<FormattedBets> => {
  console.log("Running getUserFormattedBets...");
  try {
    const rawBets = await getUserRawBets(user, numBets);
    const formattedBets = await Promise.all(
      rawBets.items.map((bet) => formatBet(bet)),
    );
    return { items: formattedBets };
  } catch (error) {
    const errorMsg = "Failed to get formatted bet details from bet ids";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};
