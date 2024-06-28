"use client";

import { useState } from "react";
import { type FormattedBet } from "@/services/services";
import { ExplorerComponent, ViewComponent } from "@/components/main-components";

export default function Home() {
  const [currentView, setCurrentView] = useState<
    FormattedBet | "create" | undefined
  >(undefined);
  return (
    <main className="flex min-h-screen items-start justify-center gap-4 p-24">
      <ExplorerComponent setViewFn={setCurrentView} />
      <ViewComponent currentBet={currentView} />
    </main>
  );
}
