"use client";

import { useState } from "react";
import { type FormattedBet } from "@/services/services";
import { ExplorerComponent, ViewComponent } from "@/components/main-components";
import { CustomConnectButton } from "@/components/rainbow/custom-connect-button";

export default function Home() {
  const [currentView, setCurrentView] = useState<
    FormattedBet | "create" | undefined
  >(undefined);
  return (
    <main className="">
      <ExplorerComponent currentView={currentView} setViewFn={setCurrentView} />
      <ViewComponent currentView={currentView} />
    </main>
  );
}
