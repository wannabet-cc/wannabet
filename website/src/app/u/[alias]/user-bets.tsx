"use client";

// Types
import type { Address } from "viem";
import type { FormattedBets } from "@/services/api/types";

// Hooks
import { useInfiniteQuery } from "@tanstack/react-query";

// Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/spinner";
import { BetTable } from "@/components/bet-table";

export function UserBets({ address }: { address: Address }) {
  return (
    <Tabs defaultValue="participating" className="w-full">
      <TabsList className="mb-2 grid w-full grid-cols-2">
        <TabsTrigger value="participating">Participating</TabsTrigger>
        <TabsTrigger value="judging">Judging</TabsTrigger>
      </TabsList>
      <TabsContent value="participating" className="flex justify-center">
        <ParticipatingBetsList address={address} />
      </TabsContent>
      <TabsContent value="judging" className="flex justify-center">
        <JudgingBetsList address={address} />
      </TabsContent>
    </Tabs>
  );
}

function ParticipatingBetsList({ address }: { address: Address }) {
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["userBetsAsParty", address],
    queryFn: ({ pageParam = "" }) =>
      fetch(`/api/bets?address=${address}&as=party&num=${10}&cursor=${pageParam}`, {
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
    <div className="w-fit">
      <LoadingSpinner />
    </div>
  ) : status === "error" ? (
    "An error has occurred: " + error.message
  ) : (
    <BetTable
      data={data}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}

function JudgingBetsList({ address }: { address: Address }) {
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["userBetsAsJudge", address],
    queryFn: ({ pageParam = "" }) =>
      fetch(`/api/bets?address=${address}&as=judge&num=${10}&cursor=${pageParam}`, {
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
    <div className="w-fit">
      <LoadingSpinner />
    </div>
  ) : status === "error" ? (
    "An error has occurred: " + error.message
  ) : (
    <BetTable
      data={data}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}
