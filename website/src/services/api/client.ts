// Queries
import {
  generateBetQuery,
  generateBetsQuery,
  generateMostRecentBetIdQuery,
  generateRecentBetsQuery,
  generateUserBetsAsJudgeQuery,
  generateUserBetsAsPartyQuery,
  generateUserBetsQuery,
} from "./queries";
// Types
import type { Address } from "viem";
import type { BetQueryResponse, BetsQueryResponse, GqlErrorResponse } from "./queries";
import type { RawBet, RawBets } from "./types";

class ApiClient {
  #baseUrl = "";

  constructor(baseUrl: string) {
    this.#baseUrl = baseUrl;
  }

  /** General function for fetching from the base graphql API */
  async #queryGqlApi<T>(query: string, cacheRevalidate: number = 0): Promise<T> {
    console.log("Running #queryGqlApi...");
    try {
      // Fetch
      const res = await fetch(this.#baseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        next: { revalidate: cacheRevalidate },
      });
      // Throw if fetch fails
      if (!res.ok) {
        throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}. Response: ${res.text()}`);
      }
      // Parse data
      const json = await res.json();
      // Throw if GraphQL error
      if ((json as GqlErrorResponse).errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
      }
      // Return
      return json as T;
    } catch (error) {
      throw new Error(`Error in #queryGqlApi: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  public async getRawBetFromId(betId: number, cacheRevalidate: number): Promise<RawBet> {
    console.log("Running getRawBetFromId...");
    const query = generateBetQuery(betId);
    const result = await this.#queryGqlApi<BetQueryResponse>(query, cacheRevalidate);
    return result.data.bet;
  }

  public async getRawBetsFromIds(betIds: number[], cacheRevalidate: number): Promise<RawBets> {
    console.log("Running getRawBetsFromIds...");
    const query = generateBetsQuery(betIds);
    const result = await this.#queryGqlApi<BetsQueryResponse>(query, cacheRevalidate);
    return result.data.bets;
  }

  public async getRecentRawBets(
    numBets: number,
    cacheRevalidate: number,
    page?: Partial<{ afterCursor: string; beforeCursor: string }>,
  ): Promise<RawBets> {
    console.log("Running getRecentRawBets...");
    const query = generateRecentBetsQuery(numBets, page);
    const result = await this.#queryGqlApi<BetsQueryResponse>(query, cacheRevalidate);
    return result.data.bets;
  }

  public async getUserRawBets(
    user: Address,
    numBets: number,
    cacheRevalidate: number,
    page?: Partial<{ afterCursor: string; beforeCursor: string }>,
  ): Promise<RawBets> {
    console.log("Running getRecentRawBets...");
    const query = generateUserBetsQuery(user, numBets, page);
    const result = await this.#queryGqlApi<BetsQueryResponse>(query, cacheRevalidate);
    return result.data.bets;
  }

  public async getUserRawBetsAsParty(
    user: Address,
    numBets: number,
    cacheRevalidate: number,
    page?: Partial<{ afterCursor: string; beforeCursor: string }>,
  ): Promise<RawBets> {
    console.log("Running getRecentRawBets...");
    const query = generateUserBetsAsPartyQuery(user, numBets, page);
    const result = await this.#queryGqlApi<BetsQueryResponse>(query, cacheRevalidate);
    return result.data.bets;
  }

  public async getUserRawBetsAsJudge(
    user: Address,
    numBets: number,
    cacheRevalidate: number,
    page?: Partial<{ afterCursor: string; beforeCursor: string }>,
  ): Promise<RawBets> {
    console.log("Running getRecentRawBets...");
    const query = generateUserBetsAsJudgeQuery(user, numBets, page);
    const result = await this.#queryGqlApi<BetsQueryResponse>(query, cacheRevalidate);
    return result.data.bets;
  }

  public async getMostRecentBetId(cacheRevalidate: number): Promise<number> {
    console.log("Running getMostRecentBetId...");
    const query = generateMostRecentBetIdQuery();
    const result = await this.#queryGqlApi<BetsQueryResponse>(query, cacheRevalidate);
    return Number(result.data.bets.items[0].id);
  }
}

export { ApiClient };
