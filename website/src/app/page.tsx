import { BetListComponent } from "@/components/bet-list-card";
import { BetDetailsCard } from "@/components/bet-details-card";

export default function Home() {
  return (
    <main className="flex min-h-screen items-start justify-center gap-4 p-24">
      <BetListComponent />
      <BetDetailsCard />
    </main>
  );
}
