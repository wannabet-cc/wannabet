import { type Address } from "viem";

/** Queries and response types for single bets */

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

export type BetQueryResponse = { data: { bet: RawBet } };

export type GqlErrorResponse = { errors: { message: string; locations: { line: number; column: number }[] }[] };

export const generateBetQuery = (betId: number) => `
query MyQuery {
	bet(id: "${betId}") {
		id
		contractAddress
		creator
		participant
		amount
		token
		message
		judge
		createdTime
		validUntil
	}
}
`;

/** Queries and response types for multiple bets */

export type RawBets = {
  items: RawBet[];
  pageInfo?: {
    hasPreviousPage: boolean;
    startCursor: string;
    hasNextPage: false;
    endCursor: string;
  };
};

export type BetsQueryResponse = { data: { bets: RawBets } };

export const generateBetsQuery = (betIds: number[]) => `
query MyQuery {
  bets(where: {id_in: [${betIds.map((id) => `"${id}"`).join(",")}]}) {
    items {
      id
			contractAddress
			creator
			participant
			amount
			token
			message
			judge
			createdTime
			validUntil
    }
  }
}
`;

export const generateRecentBetsQuery = (
  numBets: number,
  page?: Partial<{ afterCursor: string; beforeCursor: string }>,
) => `
query MyQuery {
  bets(
		orderBy: "id", 
		limit: ${numBets}, 
		orderDirection: "desc",
		${page?.afterCursor ? `after: "${page.afterCursor}",` : ""}
		${page?.beforeCursor ? `before: "${page.beforeCursor}",` : ""}
	) {
    items {
      id
			contractAddress
			creator
			participant
			amount
			token
			message
			judge
			createdTime
			validUntil
    }
		pageInfo {
      hasPreviousPage
      startCursor
      hasNextPage
      endCursor
    }
  }
}
`;

export const generateUserBetsQuery = (
  user: Address,
  numBets: number,
  page?: Partial<{ afterCursor: string; beforeCursor: string }>,
) => `
query MyQuery {
  bets(
		limit: ${numBets}, 
		orderBy: "id", 
		orderDirection: "desc",
		where: {OR: [
			{judge: "${user.toLowerCase()}"}, 
			{creator: "${user.toLowerCase()}"}, 
			{participant: "${user.toLowerCase()}"}
		]},
		${page?.afterCursor ? `after: "${page.afterCursor}",` : ""}
		${page?.beforeCursor ? `before: "${page.beforeCursor}",` : ""}
	) {
    items {
      id
			contractAddress
			creator
			participant
			amount
			token
			message
			judge
			createdTime
			validUntil
    }
		pageInfo {
      hasPreviousPage
      startCursor
      hasNextPage
      endCursor
    }
  }
}
`;

export const generateUserBetsAsPartyQuery = (
  user: Address,
  numBets: number,
  page?: Partial<{ afterCursor: string; beforeCursor: string }>,
) => `
query MyQuery {
  bets(
		limit: ${numBets}, 
		orderBy: "id", 
		orderDirection: "desc",
		where: {OR: [
			{creator: "${user.toLowerCase()}"}, 
			{participant: "${user.toLowerCase()}"}
		]},
		${page?.afterCursor ? `after: "${page.afterCursor}",` : ""}
		${page?.beforeCursor ? `before: "${page.beforeCursor}",` : ""}
	) {
    items {
      id
			contractAddress
			creator
			participant
			amount
			token
			message
			judge
			createdTime
			validUntil
    }
		pageInfo {
      hasPreviousPage
      startCursor
      hasNextPage
      endCursor
    }
  }
}
`;

export const generateUserBetsAsJudgeQuery = (
  user: Address,
  numBets: number,
  page?: Partial<{ afterCursor: string; beforeCursor: string }>,
) => `
query MyQuery {
  bets(
		limit: ${numBets}, 
		orderBy: "id", 
		orderDirection: "desc",
		where: {OR: [
			{judge: "${user.toLowerCase()}"}, 
		]},
		${page?.afterCursor ? `after: "${page.afterCursor}",` : ""}
		${page?.beforeCursor ? `before: "${page.beforeCursor}",` : ""}
	) {
    items {
      id
			contractAddress
			creator
			participant
			amount
			token
			message
			judge
			createdTime
			validUntil
    }
		pageInfo {
      hasPreviousPage
      startCursor
      hasNextPage
      endCursor
    }
  }
}
`;

export const generateMostRecentBetIdQuery = () => `
query MyQuery {
  bets(
		orderBy: "id", 
		limit: 1, 
		orderDirection: "desc",
	) {
    items {
      id
    }
  }
}
`;
