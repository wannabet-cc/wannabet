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
import {
  type FormattedBetDetails,
  getRecentFormattedBets,
} from "@/services/services";
import { LoadingSpinner } from "./ui/spinner";
import { useState } from "react";

export function BetListComponent({
  setBetFn,
}: {
  setBetFn: (bet: FormattedBetDetails) => void;
}) {
  return (
    <Tabs defaultValue="recent" className="w-full max-w-sm">
      <TabsList>
        <TabsTrigger value="recent">Recent</TabsTrigger>
        <TabsTrigger value="large">Large</TabsTrigger>
        <TabsTrigger value="my">Mine</TabsTrigger>
      </TabsList>
      <TabsContent value="recent">
        <BetListCard title="Recent bets">
          <BetList setBetFn={setBetFn} />
        </BetListCard>
      </TabsContent>
      <TabsContent value="large">
        <BetListCard title="Large bets">&lt;bet table&gt;</BetListCard>
      </TabsContent>
      <TabsContent value="my">
        <BetListCard title="My bets">&lt;bet table&gt;</BetListCard>
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

function BetList({
  setBetFn,
}: {
  setBetFn: (bet: FormattedBetDetails) => void;
}) {
  const [page, setPage] = useState(1);
  const { isLoading, error, isSuccess, data } = useQuery({
    queryKey: ["betData"],
    queryFn: () => getRecentFormattedBets(page, 5),
  });

  if (isLoading) return <LoadingSpinner />;

  if (error) return "An error has occurred: " + error;

  if (isSuccess)
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>bet</TableHead>
            <TableHead>amount</TableHead>
            <TableHead>participants</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((bet, i) => (
            <TableRow
              key={i}
              onClick={() => setBetFn(bet)}
              className="cursor-pointer"
            >
              <TableCell>{bet.betId}</TableCell>
              <TableCell>{bet.amount} usdc</TableCell>
              <TableCell>
                {bet.creatorAlias}
                <span className="text-muted-foreground"> vs </span>
                {bet.participantAlias}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
}
