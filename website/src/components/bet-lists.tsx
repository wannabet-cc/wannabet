"use client";

// Types
import type { FormattedBets } from "@/services/api/types";

// Hooks
import { useInfiniteQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useActiveWallet } from "@/hooks/useActiveWallet";

// Components
import { LoadingSpinner } from "./ui/spinner";
import { BetTable } from "./bet-table";
import { NaiveSignInButton } from "./auth/sign-in-button";

export function RecentBetList() {
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["recentBetData"],
    queryFn: ({ pageParam = "" }) =>
      fetch(`/api/bets?num=${10}&cursor=${pageParam}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => data as FormattedBets),
    staleTime: 30 * 1000,
    initialPageParam: "",
    getNextPageParam: (lastPage, _) => lastPage.pageInfo?.endCursor,
    maxPages: 7,
  });

  if (status === "pending") return <LoadingSpinner />;
  if (status === "error") return "An error has occurred: " + error.message;

  return (
    <BetTable
      data={data}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}

export function MyBetList() {
  const { ready, authenticated } = usePrivy();
  const wallet = useActiveWallet();
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["myBetData"],
    queryFn: ({ pageParam = "" }) =>
      fetch(`/api/bets?address=${wallet!.address}&num=${10}&cursor=${pageParam}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => data as FormattedBets),
    staleTime: 30 * 1000,
    initialPageParam: "",
    getNextPageParam: (lastPage, _) => lastPage.pageInfo?.endCursor,
    maxPages: 7,
    enabled: ready && authenticated && !!wallet,
  });

  if (!ready || !authenticated || !wallet) return <NaiveSignInButton />;
  if (status === "pending") return <LoadingSpinner />;
  if (status === "error") return "An error has occurred: " + error.message;

  return (
    <BetTable
      data={data}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}
