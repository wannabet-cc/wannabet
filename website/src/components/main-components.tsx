import { type FormattedBet } from "@/services/services";
import { BetListCard, MyBetList, RecentBetList } from "./bet-list-card";
import { BetDetailsCard } from "./bet-details-card";
import { CreateBetCard } from "./create-bet-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import Link from "next/link";

export function ExplorerComponent() {
  return (
    <Tabs defaultValue="recent" className="space-y-2">
      <div className="flex justify-between">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="my">Mine</TabsTrigger>
        </TabsList>
        <Button variant="outline" asChild>
          <Link href="/create">+ Create New</Link>
        </Button>
      </div>
      <TabsContent value="recent">
        <BetListCard title="Recent bets">
          <RecentBetList />
          {/* <RecentBetList currentView={currentView} setBetFn={setViewFn} /> */}
        </BetListCard>
      </TabsContent>
      <TabsContent value="my">
        <BetListCard title="My bets">
          <MyBetList />
        </BetListCard>
      </TabsContent>
    </Tabs>
  );
}

export function ViewComponent({
  currentView,
}: {
  currentView: FormattedBet | "create" | undefined;
}) {
  return (
    <div className="mt-4 w-full space-y-2" id="view">
      {currentView === "create" ? (
        <CreateBetCard />
      ) : (
        <BetDetailsCard currentBet={currentView} />
      )}
    </div>
  );
}
