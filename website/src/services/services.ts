import { betAbi } from "./betAbi";
import { arbitrumClient } from "./viem";
import { MAINNET_BET_FACTORY_CONTRACT_ADDRESS } from "./addresses";
import { betFactoryAbi } from "./betFactoryAbi";
import { Address, formatUnits } from "viem";
import { getPreferredAlias } from "@/lib/utils";

type BetStatus = "expired" | "pending" | "accepted" | "declined" | "settled";
type RawBetDetails = {
  betId: bigint;
  creator: Address;
  participant: Address;
  amount: bigint;
  token: Address;
  message: string;
  judge: Address;
  validUntil: bigint;
  status: BetStatus;
};

export const getRawBetFromAddress = async (
  betContractAddress: Address,
): Promise<RawBetDetails> => {
  console.log("Running getRawBetFromAddress...");
  try {
    const [
      betId,
      creator,
      participant,
      amount,
      token,
      message,
      judge,
      validUntil,
    ] = await arbitrumClient.readContract({
      address: betContractAddress,
      abi: betAbi,
      functionName: "betDetails",
    });
    const status = (await arbitrumClient.readContract({
      address: betContractAddress,
      abi: betAbi,
      functionName: "getStatus",
    })) as BetStatus;
    return {
      betId,
      creator,
      participant,
      amount,
      token,
      message,
      judge,
      validUntil,
      status,
    };
  } catch (error) {
    const errorMsg = "Failed to get raw bet details from address";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};

export const getRawBetFromId = async (
  betId: number,
): Promise<RawBetDetails> => {
  console.log("Running getRawBetFromId...");
  try {
    const betContractAddress = await arbitrumClient.readContract({
      address: MAINNET_BET_FACTORY_CONTRACT_ADDRESS,
      abi: betFactoryAbi,
      functionName: "betAddresses",
      args: [BigInt(betId)],
    });
    return await getRawBetFromAddress(betContractAddress);
  } catch (error) {
    const errorMsg = "Failed to get raw bet details from bet id";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};

export type FormattedBetDetails = {
  betId: number;
  creator: Address;
  creatorAlias: string;
  participant: Address;
  participantAlias: string;
  amount: number;
  token: Address;
  message: string;
  judge: Address;
  judgeAlias: string;
  validUntil: bigint;
  status: BetStatus;
};

export const formatBet = async (
  rawBetDetails: RawBetDetails,
): Promise<FormattedBetDetails> => {
  console.log("Running formatBet...");
  try {
    const [creatorAlias, participantAlias, judgeAlias] = await Promise.all([
      getPreferredAlias(rawBetDetails.creator),
      getPreferredAlias(rawBetDetails.participant),
      getPreferredAlias(rawBetDetails.judge),
    ]);
    return {
      betId: Number(rawBetDetails.betId),
      creator: rawBetDetails.creator,
      creatorAlias,
      participant: rawBetDetails.participant,
      participantAlias,
      amount: Number(formatUnits(rawBetDetails.amount, 6)),
      token: rawBetDetails.token,
      message: rawBetDetails.message,
      judge: rawBetDetails.judge,
      judgeAlias,
      validUntil: rawBetDetails.validUntil,
      status: rawBetDetails.status,
    };
  } catch (error) {
    const errorMsg = "Failed to format bet details from raw bet details";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};

export const getFormattedBetFromId = async (
  betId: number,
): Promise<FormattedBetDetails> => {
  console.log("Running getFormattedBetFromId...");
  try {
    const rawBetData = await getRawBetFromId(betId);
    return await formatBet(rawBetData);
  } catch (error) {
    const errorMsg = "Failed to get formatted bet details from bet id";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};

export const getFormattedBetsFromIds = async (
  betIds: number[],
): Promise<FormattedBetDetails[]> => {
  console.log("Running getFormattedBetsFromIds...");
  try {
    return await Promise.all(
      betIds.map((betId) => getFormattedBetFromId(betId)),
    );
  } catch (error) {
    const errorMsg = "Failed to get formatted bet details from bet ids";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};

export const getRecentFormattedBets = async (
  page: number = 1,
  numBetsPerPage: number = 5,
): Promise<FormattedBetDetails[]> => {
  console.log("Running getRecentFormattedBets...");
  try {
    const betCount = await arbitrumClient.readContract({
      address: MAINNET_BET_FACTORY_CONTRACT_ADDRESS,
      abi: betFactoryAbi,
      functionName: "betCount",
    });
    const bets = getBetIdArray(Number(betCount), page, numBetsPerPage);
    return await getFormattedBetsFromIds(bets);
  } catch (error) {
    const errorMsg = "Failed to get recent formatted bets";
    console.error(errorMsg + ": " + error);
    throw new Error(errorMsg);
  }
};

function getBetIdArray(betCount: number, page: number, numBetsPerPage: number) {
  let bets: any;
  if (page * numBetsPerPage > betCount) {
    const lastPage = Math.floor(betCount / numBetsPerPage);
    const startNum = betCount - lastPage * numBetsPerPage;
    bets = Array.from({ length: startNum }, (_, i) => startNum - i);
  } else {
    const startNum = betCount - (page - 1) * numBetsPerPage;
    bets = Array.from({ length: numBetsPerPage }, (_, i) => startNum - i);
  }
  return bets;
}
