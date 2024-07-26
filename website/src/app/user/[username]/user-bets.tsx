"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getUserFormattedBets,
  getUserFormattedBetsAsParty,
} from "@/services/services";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";

export function UserBets({ address }: { address: Address }) {
  return (
    <Tabs defaultValue="participating" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="participating">Participating</TabsTrigger>
        <TabsTrigger value="judging">Judging</TabsTrigger>
      </TabsList>
      <TabsContent value="participating">
        <ParticipatingBetsList address={address} />
      </TabsContent>
      <TabsContent value="judging">
        <JudgingBetsList address={address} />
      </TabsContent>
    </Tabs>
  );
}

function ParticipatingBetsList({ address }: { address: Address }) {
  const {
    data: bets,
    isLoading,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["userParticipatingBets"],
    queryFn: () => getUserFormattedBetsAsParty(address, 6),
  });
  if (isLoading) return "Loading...";
  if (error) return "Error:" + error.message;
  if (isSuccess)
    return (
      <div>
        {bets.items.map((bet, i) => (
          <div className="flex" key={i}>
            <div>{bet.creatorAlias}</div>
            <div>{bet.participantAlias}</div>
            <div>{bet.judgeAlias}</div>
          </div>
        ))}
      </div>
    );

  return <>Edge case</>;
}

function JudgingBetsList({ address }: { address: Address }) {
  const {
    data: bets,
    isLoading,
    error,
    isSuccess,
  } = useQuery({
    queryKey: ["userParticipatingBets"],
    queryFn: () => getUserFormattedBets(address, 6),
  });
  if (isLoading) return "Loading...";
  if (error) return "Error:" + error.message;
  if (isSuccess)
    return (
      <div>
        {bets.items.map((bet) => (
          <div className="bg-red-300">{1}</div>
        ))}
      </div>
    );

  return <>Edge case</>;
}
