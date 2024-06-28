import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from "./ui/table";
import { type FormattedBet } from "@/services/services";
import {
  CustomConnectButton,
  CustomConnectButtonSecondary,
} from "./rainbow/custom-connect-button";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { Button } from "./ui/button";
import { getTokenNameFromAddress } from "@/lib/utils";
import { BetAbi } from "@/abis/BetAbi";
import { USDC_CONTRACT_ADDRESS } from "@/config";
import { FiatTokenProxyAbi } from "@/abis/FiatTokenProxyAbi";
import { Address } from "viem";

export function BetDetailsComponent({
  currentBet,
}: {
  currentBet: FormattedBet | undefined;
}) {
  return (
    <div className="w-full max-w-md space-y-2">
      <div className="flex justify-end">
        <CustomConnectButton />
      </div>
      <BetDetailsCard currentBet={currentBet} />
    </div>
  );
}

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
          <TableCell className="flex flex-col">
            <div>
              {bet.creatorAlias}{" "}
              <span className="text-xs text-muted-foreground">
                (bet creator)
              </span>
              {account.address?.toLowerCase() === bet.creator && (
                <span className="text-xs"> &lt;- you</span>
              )}
            </div>
            <div>
              {bet.participantAlias}{" "}
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
          <TableCell>
            {bet.judgeAlias}
            {account.address?.toLowerCase() === bet.judge && (
              <span className="text-xs"> &lt;- you</span>
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>status</TableCell>
          <TableCell>
            {bet.status}{" "}
            <span className="text-xs text-muted-foreground">
              {bet.status === "pending"
                ? `(expires ${bet.validUntil.toLocaleString()})`
                : ""}
              {bet.status === "expired"
                ? `(${bet.validUntil.toLocaleString()})`
                : ""}
            </span>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>actions</TableCell>
          <TableCell>
            {account.address ? (
              <ActionButtons userAddress={account.address} bet={bet} />
            ) : (
              <CustomConnectButtonSecondary />
            )}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function ActionButtons({
  userAddress,
  bet,
}: {
  userAddress: Address;
  bet: FormattedBet;
}) {
  const { data: contractBalance } = useReadContract({
    address: USDC_CONTRACT_ADDRESS,
    abi: FiatTokenProxyAbi,
    functionName: "balanceOf",
    args: [bet.contractAddress],
  });
  const { writeContract, status, isPending } = useWriteContract();

  const isCreator = userAddress.toLowerCase() === bet.creator,
    isParticipant = userAddress.toLowerCase() === bet.participant,
    isJudge = userAddress.toLowerCase() === bet.judge;

  const creatorActions =
    Number(contractBalance) > 0 ? (
      <Button
        variant="default"
        size="sm"
        disabled={isPending}
        onClick={() =>
          writeContract({
            address: bet.contractAddress,
            abi: BetAbi,
            functionName: "retrieveTokens",
          })
        }
      >
        Retrieve funds
      </Button>
    ) : (
      <Button variant="secondary" size="sm" disabled>
        Funds retrieved
      </Button>
    );
  const participantActions = (
    <>
      <Button
        variant="default"
        size="sm"
        disabled={isPending}
        onClick={() =>
          writeContract({
            address: USDC_CONTRACT_ADDRESS,
            abi: FiatTokenProxyAbi,
            functionName: "approve",
            args: [bet.contractAddress, bet.bigintAmount],
          })
        }
      >
        Authorize
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled={isPending}
        onClick={() =>
          writeContract({
            address: bet.contractAddress,
            abi: BetAbi,
            functionName: "acceptBet",
          })
        }
      >
        Accept
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled={isPending}
        onClick={() =>
          writeContract({
            address: bet.contractAddress,
            abi: BetAbi,
            functionName: "declineBet",
          })
        }
      >
        Decline
      </Button>
    </>
  );
  const judgeActions = (
    <>
      <Button
        variant="default"
        size="sm"
        disabled={isPending}
        onClick={() =>
          writeContract({
            address: bet.contractAddress,
            abi: BetAbi,
            functionName: "settleBet",
            args: [bet.creator],
          })
        }
      >
        {bet.creatorAlias}
      </Button>
      <Button
        variant="default"
        size="sm"
        disabled={isPending}
        onClick={() =>
          writeContract({
            address: bet.contractAddress,
            abi: BetAbi,
            functionName: "settleBet",
            args: [bet.participant],
          })
        }
      >
        {bet.participantAlias}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled={isPending}
        onClick={() =>
          writeContract({
            address: bet.contractAddress,
            abi: BetAbi,
            functionName: "settleBet",
            args: ["0x0000000000000000000000000000000000000000"],
          })
        }
      >
        Tie
      </Button>
    </>
  );

  return (
    <div className="flex gap-1">
      {isCreator && bet.status === "expired" && creatorActions}
      {isParticipant && bet.status === "pending" && participantActions}
      {isJudge && bet.status === "accepted" && judgeActions}
      <span className="hidden only:inline-block">...</span>
    </div>
  );
}
