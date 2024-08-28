"use client";

// Types
import type { FormattedBet } from "@/services/api/types";
// Contract Info
import { baseContracts } from "@/lib";
// Hooks
import { useAccount } from "wagmi";
// Components
import { Table, TableBody, TableCaption, TableCell, TableRow } from "@/components/ui/table";
import { UserBadge } from "@/components/misc/user-badge";
import { TransactionButtons } from "./transaction-buttons";

export function BetDetails({ bet }: { bet: FormattedBet }) {
  const account = useAccount();
  return (
    <Table>
      <TableCaption>Details of wannabet #{bet.betId}</TableCaption>
      <TableBody>
        <TableRow>
          <TableCell>parties</TableCell>
          <TableCell className="flex flex-col space-y-1">
            <div className="&>*:w-fit flex items-center space-x-1">
              <UserBadge user={bet.creator} /> <span className="text-xs text-muted-foreground">(bet creator)</span>
              {account.address?.toLowerCase() === bet.creator.address.toLowerCase() && (
                <span className="text-xs"> &lt;- you</span>
              )}
            </div>
            <div className="&>*:w-fit flex items-center space-x-1">
              <UserBadge user={bet.participant} /> <span className="text-xs text-muted-foreground">(participant)</span>
              {account.address?.toLowerCase() === bet.participant.address.toLowerCase() && (
                <span className="text-xs"> &lt;- you</span>
              )}
            </div>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>amount</TableCell>
          <TableCell>
            {bet.amount} {baseContracts.getNameFromAddress(bet.token)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>message</TableCell>
          <TableCell>{bet.message}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>judge</TableCell>
          <TableCell className="&>*:w-fit flex items-center space-x-1">
            <UserBadge user={bet.judge} />
            {account.address?.toLowerCase() === bet.judge.address.toLowerCase() && (
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
                if (bet.winner === "0x0000000000000000000000000000000000000000") return ": tie";
                else if (bet.winner.toLowerCase() === bet.creator.address.toLowerCase())
                  return `: ${bet.creator.name} won`;
                else if (bet.winner.toLowerCase() === bet.participant.address.toLowerCase())
                  return `: ${bet.participant.name} won`;
                else return "";
              })()}
            <span className="text-xs text-muted-foreground">
              {bet.status === "pending" ? ` (expires ${bet.validUntil.toLocaleString()})` : ""}
              {bet.status === "expired" ? ` (${bet.validUntil.toLocaleString()})` : ""}
            </span>
            {bet.judgementReason && <p className="text-xs text-muted-foreground">reason: {bet.judgementReason}</p>}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>actions</TableCell>
          <TableCell>
            <TransactionButtons bet={bet} />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
