"use client";

import {
  type FormattedBets,
  getRecentFormattedBets,
  getUserFormattedBets,
} from "@/services/services";
import { type InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { LoginButton } from "./auth/login-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { LoadingSpinner } from "./ui/spinner";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { UserBadge } from "./misc/user-badge";
import { getTokenNameFromAddress } from "@/lib/utils";

function BetList({
  data,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  data: InfiniteData<FormattedBets, unknown> | undefined;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: any;
}) {
  const router = useRouter();
  return (
    <ScrollArea className="h-80 w-full pr-2">
      <Table>
        <TableHeader className="sticky top-0 bg-card">
          <TableRow>
            <TableHead className="text-center">bet</TableHead>
            <TableHead>amount</TableHead>
            <TableHead>participants</TableHead>
            <TableHead className="text-center">status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.pages.map((page) =>
            page.items.map((bet, i) => (
              <TableRow
                key={i}
                onClick={() => router.push(`/bet/${bet.betId}`)}
                className="cursor-pointer"
              >
                <TableCell className="text-center">{bet.betId}</TableCell>
                <TableCell>
                  {bet.amount} {getTokenNameFromAddress(bet.token)}
                </TableCell>
                <TableCell>
                  <UserBadge userAlias={bet.creatorAlias} />
                  <span className="text-muted-foreground"> vs </span>
                  <UserBadge userAlias={bet.participantAlias} />
                </TableCell>
                <TableCell className="text-center">
                  {bet.status === "pending" ? (
                    <span>⌛️</span>
                  ) : bet.status === "accepted" ? (
                    <span className="text-green-700">✓</span>
                  ) : bet.status === "declined" || bet.status === "expired" ? (
                    <span className="text-lg leading-none text-red-700">𐄂</span>
                  ) : bet.status === "settled" ? (
                    <span>💰</span>
                  ) : (
                    "..."
                  )}
                </TableCell>
              </TableRow>
            )),
          )}
          <TableRow>
            <TableCell colSpan={4}>
              <div className="mx-auto w-fit">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNextPage || isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                >
                  {isFetchingNextPage
                    ? "Loading..."
                    : hasNextPage
                      ? "Load More"
                      : "Nothing more to load"}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </ScrollArea>
  );
}

export function RecentBetList() {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
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
    <BetList
      data={data}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}

export function MyBetList() {
  const account = useAccount();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["myBetData"],
    queryFn: ({ pageParam = "" }) =>
      fetch(
        `/api/bets?address=${account.address!}&num=${10}&cursor=${pageParam}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
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
    <BetList
      data={data}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
}
