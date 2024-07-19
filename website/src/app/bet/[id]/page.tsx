"use client";

import { BetDetailsCard } from "@/components/bet-details-card";
import { BackButton } from "@/components/back-button";
import { getFormattedBetFromId } from "@/services/services";
import { useQuery } from "@tanstack/react-query";

/**
 * Temporarily using client fetching until the service fetch
 * functions can be reconfigured correctly
 */

export default function BetPage({ params }: { params: { id: number } }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["queryBet", params.id],
    queryFn: () => getFormattedBetFromId(params.id),
  });

  if (isLoading) return "Loading...";
  if (error) return "Error" + error.message;

  return (
    <main className="flex w-full flex-col items-center">
      <div className="w-full space-y-2 px-8">
        <BackButton />
        <BetDetailsCard currentBet={data} />
      </div>
    </main>
  );
}
