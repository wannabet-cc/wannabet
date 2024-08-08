import { BET_API_URL } from "@/config/server";
import { generateBetQuery } from "./queries";
import type { BetQueryResponse, BetsQueryResponse, GqlErrorResponse, RawBet } from "./queries";

class ApiService {
  #baseUrl = "";

  constructor(baseUrl: string) {
    this.#baseUrl = baseUrl;
  }

  /** General function for fetching from the base graphql API */
  async #queryGqlApi<T>(query: string, cacheRevalidate: number): Promise<T> {
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
}

const apiService = new ApiService(BET_API_URL);

export { apiService };
