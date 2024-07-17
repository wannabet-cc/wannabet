import { type FormattedBet } from "@/services/services";
import { getTokenNameFromAddress } from "@/lib/utils";
import { useAccount } from "wagmi";
import { CustomConnectButtonSecondary } from "./rainbow/custom-connect-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from "./ui/table";
import { Avatar, AvatarImage } from "./ui/avatar";
import { UserBadge } from "./misc/user-badge";
import { TransactionButtons } from "./transaction-buttons";

export function BetDetailsCard({
  currentBet,
}: {
  currentBet: FormattedBet | undefined;
}) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">
          {currentBet ? `Bet #${currentBet.betId}` : "Select a bet"}
        </CardTitle>
        <CardDescription>
          {currentBet ? (
            <a
              href={`https://basescan.org/address/${currentBet.contractAddress}`}
              target="_blank"
            >
              See on Basescan
            </a>
          ) : (
            ""
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {currentBet && <BetDetails bet={currentBet} />}
      </CardContent>
    </Card>
  );
}

function BetDetails({ bet }: { bet: FormattedBet }) {
  const account = useAccount();

  return (
    <Table>
      <TableCaption>Details of WannaBet #{bet.betId}</TableCaption>
      <TableBody>
        <TableRow>
          <TableCell>parties</TableCell>
          <TableCell className="flex flex-col space-y-1">
            <div className="&>*:w-fit flex items-center space-x-1">
              {bet.creatorPfp && (
                <Avatar>
                  <AvatarImage src={bet.creatorPfp} />
                </Avatar>
              )}
              <UserBadge userAlias={bet.creatorAlias} />{" "}
              <span className="text-xs text-muted-foreground">
                (bet creator)
              </span>
              {account.address?.toLowerCase() === bet.creator && (
                <span className="text-xs"> &lt;- you</span>
              )}
            </div>
            <div className="&>*:w-fit flex items-center space-x-1">
              {bet.participantPfp && (
                <Avatar>
                  <AvatarImage src={bet.participantPfp} />
                </Avatar>
              )}
              <UserBadge userAlias={bet.participantAlias} />{" "}
              <span className="text-xs text-muted-foreground">
                (participant)
              </span>
              {account.address?.toLowerCase() === bet.participant && (
                <span className="text-xs"> &lt;- you</span>
              )}
            </div>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>amount</TableCell>
          <TableCell>
            {bet.amount} {account.chain?.name.split(" ")[0]}{" "}
            {getTokenNameFromAddress(bet.token)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>message</TableCell>
          <TableCell>{bet.message}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>judge</TableCell>
          <TableCell className="&>*:w-fit flex items-center space-x-1">
            {bet.judgePfp && (
              <Avatar>
                <AvatarImage src={bet.judgePfp} />
              </Avatar>
            )}
            <UserBadge userAlias={bet.judgeAlias} />
            {account.address?.toLowerCase() === bet.judge && (
              <span className="text-xs"> &lt;- you</span>
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>status</TableCell>
          <TableCell>
            {bet.status === "pending" ? (
              <span className="mr-1">⌛️</span>
            ) : bet.status === "accepted" ? (
              <span className="mr-1 text-green-700">✓</span>
            ) : bet.status === "declined" || bet.status === "expired" ? (
              <span className="mr-1 text-lg leading-none text-red-700">𐄂</span>
            ) : bet.status === "settled" ? (
              <span className="mr-1">💰</span>
            ) : (
              ""
            )}
            {bet.status}
            {bet.status === "settled" &&
              bet.winner &&
              (() => {
                if (bet.winner === "0x0000000000000000000000000000000000000000")
                  return ": tie";
                else if (bet.winner.toLowerCase() === bet.creator)
                  return `: ${bet.creatorAlias} won`;
                else if (bet.winner.toLowerCase() === bet.participant)
                  return `: ${bet.participantAlias} won`;
                else return "";
              })()}
            <span className="text-xs text-muted-foreground">
              {bet.status === "pending"
                ? ` (expires ${bet.validUntil.toLocaleString()})`
                : ""}
              {bet.status === "expired"
                ? ` (${bet.validUntil.toLocaleString()})`
                : ""}
            </span>
            {bet.judgementReason && (
              <p className="text-xs text-muted-foreground">
                reason: {bet.judgementReason}
              </p>
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>actions</TableCell>
          <TableCell>
            {account.address ? (
              <TransactionButtons bet={bet} />
            ) : (
              <CustomConnectButtonSecondary />
            )}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
