import { type FormattedBet } from "@/services/services";
import { CustomConnectButton } from "./rainbow/custom-connect-button";
import Link from "next/link";
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
      <div className="mb-8 hidden text-3xl font-semibold lg:flex">
        <Link href="https://wannabet.cc">WannaBet 🤝</Link>
      </div>
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
    <div className="w-full max-w-md space-y-2 lg:mt-[68px]" id="view">
      <div className="hidden lg:flex lg:justify-end">
        <CustomConnectButton />
      </div>
      {currentView === "create" ? (
        <CreateBetCard />
      ) : (
        <BetDetailsCard currentBet={currentView} />
      )}
    </div>
  );
}
