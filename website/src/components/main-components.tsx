import { type FormattedBet } from "@/services/services";
import { BetListCard, MyBetList, RecentBetList } from "./bet-list-card";
import { BetDetailsCard } from "./bet-details-card";
import { CreateBetCard } from "./create-bet-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { useMediaQuery } from "@/lib/hooks";
import { scrolltoHash } from "@/lib/utils";

export function ExplorerComponent({
  currentView,
  setViewFn,
}: {
  currentView: FormattedBet | "create" | undefined;
  setViewFn: (view: FormattedBet | "create") => void;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return (
    <Tabs defaultValue="recent" className="w-full max-w-lg space-y-2">
      <div className="flex justify-between">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="my">Mine</TabsTrigger>
        </TabsList>
        <Button
          variant="outline"
          onClick={() => {
            setViewFn("create");
            if (!isDesktop) scrolltoHash("view");
          }}
        >
          + Create New
        </Button>
      </div>
      <TabsContent value="recent">
        <BetListCard title="Recent bets">
          <RecentBetList currentView={currentView} setBetFn={setViewFn} />
        </BetListCard>
      </TabsContent>
      <TabsContent value="my">
        <BetListCard title="My bets">
          <MyBetList currentView={currentView} setBetFn={setViewFn} />
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
    <div className="mt-4 w-full max-w-md space-y-2" id="view">
      {currentView === "create" ? (
        <CreateBetCard />
      ) : (
        <BetDetailsCard currentBet={currentView} />
      )}
    </div>
  );
}
