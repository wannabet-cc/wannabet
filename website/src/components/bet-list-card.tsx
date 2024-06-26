"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useQuery } from "react-query";
import { getFormattedBetsFromIds } from "@/services/services";
import { LoadingSpinner } from "./ui/spinner";

export function BetListComponent() {
  return (
    <Tabs defaultValue="recent" className="w-full max-w-sm">
      <TabsList>
        <TabsTrigger value="recent">Recent</TabsTrigger>
        <TabsTrigger value="large">Large</TabsTrigger>
        <TabsTrigger value="my">Mine</TabsTrigger>
      </TabsList>
      <TabsContent value="recent">
        <BetListCard>
          <BetList />
        </BetListCard>
      </TabsContent>
      <TabsContent value="large">
        <BetListCard>&lt;bet table&gt;</BetListCard>
      </TabsContent>
      <TabsContent value="my">
        <BetListCard>&lt;bet table&gt;</BetListCard>
      </TabsContent>
    </Tabs>
  );
}

function BetListCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Bets</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center pt-4">{children}</CardContent>
    </Card>
  );
}

function BetList() {
  const { isLoading, error, isSuccess, data } = useQuery({
    queryKey: ["betData"],
    queryFn: () => getFormattedBetsFromIds([3, 4, 5]),
  });

  if (isLoading) <LoadingSpinner />;

  if (error) return "An error has occurred: " + error;

  if (isSuccess)
    return (
      <Table>
        <TableCaption>All recent WannaBet contract bets</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>bet</TableHead>
            <TableHead>amount</TableHead>
            <TableHead>participants</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((bet, i) => (
            <TableRow key={i}>
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
