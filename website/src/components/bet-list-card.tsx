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
import { useQuery } from "@tanstack/react-query";
import {
  type FormattedBet,
  type FormattedBets,
  getRecentFormattedBets,
  getUserFormattedBets,
} from "@/services/services";
import { LoadingSpinner } from "./ui/spinner";
import { Button } from "./ui/button";

export function BetListComponent({
  setBetFn,
}: {
  setBetFn: (bet: FormattedBet) => void;
}) {
  return (
    <Tabs defaultValue="recent" className="w-full max-w-md space-y-2">
      <div className="flex justify-between">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="my">Mine</TabsTrigger>
        </TabsList>
        <Button variant="ghost">+ Create New</Button>
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
    <Card className="max-h-[512px] w-full">
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
  const { isPending, error, isSuccess, data } = useQuery({
    queryKey: ["recentBetData"],
    queryFn: () => getRecentFormattedBets(5),
  });
  if (isPending) return <LoadingSpinner />;
  if (error) return "An error has occurred: " + error;
  if (isSuccess) return <BetList data={data} setBetFn={setBetFn} />;
}

function MyBetList({ setBetFn }: { setBetFn: (bet: FormattedBet) => void }) {
  const { isPending, error, isSuccess, data } = useQuery({
    queryKey: ["recentBetData"],
    queryFn: () =>
      getUserFormattedBets("0x5db9534804B440Aa1937eA0CDE734FAE1043C996", 5),
  });
  if (isPending) return <LoadingSpinner />;
  if (error) return "An error has occurred: " + error;
  if (isSuccess) return <BetList data={data} setBetFn={setBetFn} />;
}

function BetList({
  data,
  setBetFn,
}: {
  data: FormattedBets;
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
        {data.items.map((bet, i) => (
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
