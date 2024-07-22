import {
  BetListCard,
  MyBetList,
  RecentBetList,
} from "../components/bet-list-card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="w-full md:px-8">
      <ExplorerComponent />
    </main>
  );
}

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
