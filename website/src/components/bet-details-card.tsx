import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from "./ui/table";
import { FormattedBetDetails } from "@/services/services";

export function BetDetailsCard({
  currentBet,
}: {
  currentBet: FormattedBetDetails | undefined;
}) {
  return (
    currentBet && (
      <Card className="mt-10 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Bet #{currentBet.betId}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <BetDetails
            betId={currentBet.betId}
            creator={currentBet.creatorAlias}
            participant={currentBet.participantAlias}
            amount={currentBet.amount}
            chain="Arbitrum"
            token="USDC"
            message={currentBet.message}
            judge={currentBet.judgeAlias}
            status={currentBet.status}
            actions="..."
          />
        </CardContent>
      </Card>
    )
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
      <TableCaption>Details of WannaBet #{props.betId}</TableCaption>
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
