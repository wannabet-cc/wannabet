"use client";

// Types
import type { FormattedBets } from "@/services/api/types";
import type { InfiniteData } from "@tanstack/react-query";

// Components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { UserBadge } from "./misc/user-badge";

// Utility Functions
import { baseContracts } from "@/lib";
import Link from "next/link";

export function BetTable({
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
  return (
    <ScrollArea className="h-80 w-full pr-2">
      <Table>
        <TableHeader className="sticky top-0 z-50 bg-card">
          <TableRow>
            <TableHead className="text-center">bet</TableHead>
            <TableHead>amount</TableHead>
            <TableHead>participants</TableHead>
            <TableHead className="text-center">status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.pages.map((page) =>
            page.items.map((bet, i) => (
              <TableRow key={i}>
                <TableCell className="text-center">{bet.betId}</TableCell>
                <TableCell>
                  {bet.amount} {baseContracts.getNameFromAddress(bet.token)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <UserBadge user={bet.creator} />
                    <span className="text-muted-foreground"> vs </span>
                    <UserBadge user={bet.participant} />
                  </div>
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
                <TableCell>
                  <Button asChild variant="secondary" size="xs">
                    <Link href={`/b/${bet.betId}`} className="h-full w-full">
                      See Bet
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            )),
          )}
          <TableRow>
            <TableCell colSpan={5}>
              <div className="mx-auto w-fit">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasNextPage || isFetchingNextPage}
                  onClick={() => fetchNextPage()}
                >
                  {isFetchingNextPage ? "Loading..." : hasNextPage ? "Load More" : "Nothing more to load"}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
