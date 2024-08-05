"use client";

// Types
import { type FormattedBets } from "@/services/services";
import { type InfiniteData } from "@tanstack/react-query";

// Hooks
import { useRouter } from "next/navigation";

// Components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { UserBadge } from "./misc/user-badge";

// Utility Functions
import { getTokenNameFromAddress } from "@/lib";

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
