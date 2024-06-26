import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export function BetDetailsCard() {
  return (
    <Card className="mt-10 w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Bet #{"4"}</CardTitle>
        {/* <CardDescription></CardDescription> */}
      </CardHeader>
      <CardContent className="grid gap-4">
        <BetDetails
          betId={4}
          creator="limes.eth"
          participant="ncale.eth"
          amount={1}
          chain="Arbitrum"
          token="USDC"
          message="Test bet message"
          judge="slobo.eth"
          status="pending"
          actions="buttons"
        />
      </CardContent>
      {/* <CardFooter></CardFooter> */}
    </Card>
  );
}

function BetDetails(props: {
  betId: number;
  creator: string;
  participant: string;
  amount: number;
  chain: string;
  token: string;
  message: string;
  judge: string;
  status: string;
  actions: string;
}) {
  return (
    <Table>
      <TableCaption>Details of WannaBet #{}</TableCaption>
      <TableBody>
        <TableRow>
          <TableCell>parties</TableCell>
          <TableCell className="flex flex-col">
            <div>{props.creator} (bet creator)</div>
            <div>{props.participant} (participant)</div>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>amount</TableCell>
          <TableCell>
            {props.amount} {props.chain} {props.token}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>message</TableCell>
          <TableCell>{props.message}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>judge</TableCell>
          <TableCell>{props.judge}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>status</TableCell>
          <TableCell>{props.status}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>actions</TableCell>
          <TableCell>{props.actions}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
