import { BET_API_URL } from "@/config/server";
import { ApiClient } from "./client";
import { BetFormatter, type FormattedBets, type FormattedBet } from "./formatter";
import type { Address } from "viem";

class ApiService {
  #apiClient = new ApiClient(BET_API_URL);
  #betFormatter = new BetFormatter();

  constructor() {}

  public async getFormattedBetFromId(betId: number, cacheRevalidate: number): Promise<FormattedBet> {
    console.log("Running getFormattedBetFromId...");
    const rawBet = await this.#apiClient.getRawBetFromId(betId, cacheRevalidate);
    const formattedBetList = await this.#betFormatter.formatBets([rawBet]);
    return formattedBetList[0];
  }

  public async getFormattedBetsFromIds(betIds: number[], cacheRevalidate: number): Promise<FormattedBets> {
    console.log("Running getFormattedBetsFromIds...");
    const rawBets = await this.#apiClient.getRawBetsFromIds(betIds, cacheRevalidate);
    const formattedBets = await this.#betFormatter.formatBets(rawBets.items);
    return { items: formattedBets, pageInfo: rawBets.pageInfo };
  }

  public async getRecentFormattedBets(
    numBets: number = 5,
    cacheRevalidate: number,
    page?: Partial<{ afterCursor: string; beforeCursor: string }>,
  ): Promise<FormattedBets> {
    console.log("Running getRecentFormattedBets...");

    const rawBets = await this.#apiClient.getRecentRawBets(numBets, cacheRevalidate, page);
    const formattedBets = await this.#betFormatter.formatBets(rawBets.items);
    return { items: formattedBets, pageInfo: rawBets.pageInfo };
  }

  public async getUserFormattedBets(
    user: Address,
    numBets: number = 5,
    cacheRevalidate: number,
    page?: Partial<{ afterCursor: string; beforeCursor: string }>,
  ): Promise<FormattedBets> {
    console.log("Running getUserFormattedBets...");
    const rawBets = await this.#apiClient.getUserRawBets(user, numBets, cacheRevalidate, page);
    const formattedBets = await this.#betFormatter.formatBets(rawBets.items);
    return { items: formattedBets, pageInfo: rawBets.pageInfo };
  }

  public async getUserFormattedBetsAsParty(
    user: Address,
    numBets: number = 5,
    cacheRevalidate: number,
    page?: Partial<{ afterCursor: string; beforeCursor: string }>,
  ): Promise<FormattedBets> {
    console.log("Running getUserFormattedBets...");
    const rawBets = await this.#apiClient.getUserRawBetsAsParty(user, numBets, cacheRevalidate, page);
    const formattedBets = await this.#betFormatter.formatBets(rawBets.items);
    return { items: formattedBets, pageInfo: rawBets.pageInfo };
  }

  public async getUserFormattedBetsAsJudge(
    user: Address,
    numBets: number = 5,
    cacheRevalidate: number,
    page?: Partial<{ afterCursor: string; beforeCursor: string }>,
  ): Promise<FormattedBets> {
    console.log("Running getUserFormattedBets...");
    const rawBets = await this.#apiClient.getUserRawBetsAsJudge(user, numBets, cacheRevalidate, page);
    const formattedBets = await this.#betFormatter.formatBets(rawBets.items);
    return { items: formattedBets, pageInfo: rawBets.pageInfo };
  }
}

const apiService = new ApiService();

export { apiService };
