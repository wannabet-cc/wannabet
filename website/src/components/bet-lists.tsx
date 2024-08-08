"use client";

// Types
import type { FormattedBets } from "@/services/api/types";

// Hooks
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

// Components
import { LoginButton } from "./auth/login-button";
import { LoadingSpinner } from "./ui/spinner";
import { BetTable } from "./bet-table";

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
    initialPageParam: "",
    getNextPageParam: (lastPage, _) => lastPage.pageInfo?.endCursor,
    maxPages: 7,
  });
  return status === "pending" ? (
    <LoadingSpinner />
  ) : status === "error" ? (
    "An error has occurred: " + { error }
  ) : (
    <BetTable
      data={data}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}

export function MyBetList() {
  const account = useAccount();
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["myBetData"],
    queryFn: ({ pageParam = "" }) =>
      fetch(`/api/bets?address=${account.address!}&num=${10}&cursor=${pageParam}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => data as FormattedBets),
    initialPageParam: "",
    getNextPageParam: (lastPage, _) => lastPage.pageInfo?.endCursor,
    maxPages: 7,
    enabled: account.isConnected,
  });
  return account.isDisconnected ? (
    <LoginButton />
  ) : status === "pending" ? (
    <LoadingSpinner />
  ) : status === "error" ? (
    "An error has occurred: " + { error }
  ) : (
    <BetTable
      data={data}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}
