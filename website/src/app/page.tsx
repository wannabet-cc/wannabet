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
    <main className="mt-8 flex min-h-screen flex-col items-center gap-4 p-1 lg:mt-0 lg:flex-row lg:items-start lg:justify-center lg:p-24">
      <div>
        <div className="mb-4 flex justify-end lg:hidden">
          <CustomConnectButton />
        </div>
        <ExplorerComponent
          currentView={currentView}
          setViewFn={setCurrentView}
        />
        <ViewComponent currentView={currentView} />
      </div>
    </main>
  );
}
