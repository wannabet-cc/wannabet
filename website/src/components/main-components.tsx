import { type FormattedBet } from "@/services/services";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { BetListCard, MyBetList, RecentBetList } from "./bet-list-card";
import { CustomConnectButton } from "./rainbow/custom-connect-button";
import { BetDetailsCard } from "./bet-details-card";
import { CreateBetCard } from "./create-bet-card";

export function ExplorerComponent({
  setViewFn,
}: {
  setViewFn: (view: FormattedBet | "create") => void;
}) {
  return (
    <Tabs defaultValue="recent" className="w-full max-w-md space-y-2">
      <div className="flex justify-between">
        <TabsList>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="my">Mine</TabsTrigger>
        </TabsList>
        <Button variant="ghost" onClick={() => setViewFn("create")}>
          + Create New
        </Button>
      </div>
      <TabsContent value="recent">
        <BetListCard title="Recent bets">
          <RecentBetList setBetFn={setViewFn} />
        </BetListCard>
      </TabsContent>
      <TabsContent value="my">
        <BetListCard title="My bets">
          <MyBetList setBetFn={setViewFn} />
        </BetListCard>
      </TabsContent>
    </Tabs>
  );
}

export function ViewComponent({
  currentBet,
}: {
  currentBet: FormattedBet | "create" | undefined;
}) {
  return (
    <div className="w-full max-w-md space-y-2">
      <div className="flex justify-end">
        <CustomConnectButton />
      </div>
      {currentBet === "create" ? (
        <CreateBetCard />
      ) : (
        <BetDetailsCard currentBet={currentBet} />
      )}
    </div>
  );
}
