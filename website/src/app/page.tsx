"use client";

import { useState } from "react";
import { type FormattedBet } from "@/services/services";
import { ExplorerComponent } from "@/components/main-components";

export default function Home() {
  const [currentView, setCurrentView] = useState<
    FormattedBet | "create" | undefined
  >(undefined);
  return (
    <main className="w-full md:px-8">
      <ExplorerComponent currentView={currentView} setViewFn={setCurrentView} />
    </main>
  );
}
