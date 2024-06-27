"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useQuery } from "react-query";
import { type FormattedBet, getRecentFormattedBets } from "@/services/services";
import { LoadingSpinner } from "./ui/spinner";
import { useState } from "react";
import { Button } from "./ui/button";

export function BetListComponent({
  setBetFn,
}: {
  setBetFn: (bet: FormattedBet) => void;
}) {
  return (
    <Tabs defaultValue="recent" className="w-full max-w-md">
      <div className="flex justify-between">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="my">Mine</TabsTrigger>
        </TabsList>
        <Button variant="outline" size={"sm"}>
          + Create New
        </Button>
      </div>
      <TabsContent value="recent">
        <BetListCard title="Recent bets">
          <RecentBetList setBetFn={setBetFn} />
        </BetListCard>
      </TabsContent>
      <TabsContent value="my">
        <BetListCard title="My bets">
          <MyBetList setBetFn={setBetFn} />
        </BetListCard>
      </TabsContent>
    </Tabs>
  );
}

function BetListCard({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center pt-4">{children}</CardContent>
    </Card>
  );
}

function RecentBetList({
  setBetFn,
}: {
  setBetFn: (bet: FormattedBet) => void;
}) {
  const [page, setPage] = useState(1);
  const { isLoading, error, isSuccess, data } = useQuery({
    queryKey: ["betData"],
    queryFn: () => getRecentFormattedBets(4),
  });
  if (isLoading) return <LoadingSpinner />;
  if (error) return "An error has occurred: " + error;
  if (isSuccess) return <BetList data={data.items} setBetFn={setBetFn} />;
}

function MyBetList({ setBetFn }: { setBetFn: (bet: FormattedBet) => void }) {
  return <>&lt;bet table&gt;</>;
}

function BetList({
  data,
  setBetFn,
}: {
  data: FormattedBet[];
  setBetFn: (bet: FormattedBet) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">bet</TableHead>
          <TableHead>amount</TableHead>
          <TableHead>participants</TableHead>
          <TableHead className="text-center">active?</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((bet, i) => (
          <TableRow
            key={i}
            onClick={() => setBetFn(bet)}
            className="cursor-pointer"
          >
            <TableCell className="text-center">{bet.betId}</TableCell>
            <TableCell>{bet.amount} USDC</TableCell>
            <TableCell>
              {bet.creatorAlias}
              <span className="text-muted-foreground"> vs </span>
              {bet.participantAlias}
            </TableCell>
            <TableCell className="text-center">
              {bet.status === "pending" || bet.status === "accepted" ? (
                <span className="text-green-700">✓</span>
              ) : (
                <span className="text-red-700">𐄂</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
