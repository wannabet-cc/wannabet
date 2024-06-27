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
