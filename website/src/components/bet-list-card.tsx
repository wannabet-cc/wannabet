import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export function BetListCard() {
  return (
    <Tabs defaultValue="recent" className="w-full max-w-sm">
      <TabsList>
        <TabsTrigger value="recent">Recent</TabsTrigger>
        <TabsTrigger value="large">Large</TabsTrigger>
        <TabsTrigger value="my">Mine</TabsTrigger>
      </TabsList>
      <TabsContent value="recent">
        <BetList />
      </TabsContent>
      <TabsContent value="large">
        <BetListEx />
      </TabsContent>
      <TabsContent value="my">
        <BetListEx />
      </TabsContent>
    </Tabs>
  );
}

const data = [
  {
    betId: 4,
    amount: 1,
    party1: "limes.eth",
    party2: "ncale.eth",
  },
  {
    betId: 6,
    amount: 3,
    party1: "limes.eth",
    party2: "ncale.eth",
  },
];

function BetList() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Bets</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Table>
          <TableCaption>All recent WannaBet contract bets</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>bet</TableHead>
              <TableHead>amount</TableHead>
              <TableHead>participants</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((bet, i) => (
              <TableRow key={i}>
                <TableCell>{bet.betId}</TableCell>
                <TableCell>{bet.amount}</TableCell>
                <TableCell>
                  {bet.party1}
                  <span className="text-muted-foreground"> vs </span>
                  {bet.party2}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function BetListEx() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Bets</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">&lt;bet table&gt;</div>
      </CardContent>
    </Card>
  );
}
