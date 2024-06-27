"use client";

import { BetListComponent } from "@/components/bet-list-card";
import { BetDetailsCard } from "@/components/bet-details-card";
import { useState } from "react";
import { type FormattedBet } from "@/services/services";

export default function Home() {
  const [currentBet, setCurrentBet] = useState<FormattedBet | undefined>(
    undefined,
  );
  return (
    <main className="flex min-h-screen items-start justify-center gap-4 p-24">
      <BetListComponent setBetFn={setCurrentBet} />
      <BetDetailsCard currentBet={currentBet} />
    </main>
  );
}
