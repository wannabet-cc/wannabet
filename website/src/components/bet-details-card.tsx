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
import { type FormattedBet } from "@/services/services";
import { CustomConnectButtonSecondary } from "./rainbow/custom-connect-button";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { Button } from "./ui/button";
import { getTokenNameFromAddress } from "@/lib/utils";
import { BetAbi } from "@/abis/BetAbi";
import { BASE_USDC_ADDRESS } from "@/config";
import { FiatTokenProxyAbi } from "@/abis/FiatTokenProxyAbi";
import { Address, parseUnits } from "viem";
import { useToast } from "./ui/use-toast";

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
              href={`https://arbiscan.io/address/${currentBet.contractAddress}`}
              target="_blank"
            >
              See on Arbiscan
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
  const account = useAccount();
  const { toast } = useToast();
  const { data: contractBalance } = useReadContract({
    address: BASE_USDC_ADDRESS,
    abi: FiatTokenProxyAbi,
    functionName: "balanceOf",
    args: [bet.contractAddress],
  });
  const { writeContractAsync, isPending } = useWriteContract();

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
          writeContractAsync(
            {
              address: bet.contractAddress,
              abi: BetAbi,
              functionName: "retrieveTokens",
            },
            { onSuccess: () => toast({ title: "Bet retrieved successfully" }) },
          )
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
        onClick={async () => {
          await writeContractAsync({
            address: BASE_USDC_ADDRESS,
            abi: FiatTokenProxyAbi,
            functionName: "approve",
            args: [bet.contractAddress, bet.bigintAmount],
          });
          writeContractAsync(
            {
              address: bet.contractAddress,
              abi: BetAbi,
              functionName: "acceptBet",
              value: parseUnits("0.0002", 18),
            },
            { onSuccess: () => toast({ title: "Bet accepted successfully" }) },
          );
        }}
      >
        Accept
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled={isPending}
        onClick={() =>
          writeContractAsync(
            {
              address: bet.contractAddress,
              abi: BetAbi,
              functionName: "declineBet",
            },
            { onSuccess: () => toast({ title: "Bet declined successfully" }) },
          )
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
          writeContractAsync(
            {
              address: bet.contractAddress,
              abi: BetAbi,
              functionName: "settleBet",
              args: [bet.creator, ""],
            },
            { onSuccess: () => toast({ title: "Bet settled successfully" }) },
          )
        }
      >
        {bet.creatorAlias}
      </Button>
      <Button
        variant="default"
        size="sm"
        disabled={isPending}
        onClick={() =>
          writeContractAsync(
            {
              address: bet.contractAddress,
              abi: BetAbi,
              functionName: "settleBet",
              args: [bet.participant, ""],
            },
            { onSuccess: () => toast({ title: "Bet settled successfully" }) },
          )
        }
      >
        {bet.participantAlias}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled={isPending}
        onClick={() =>
          writeContractAsync(
            {
              address: bet.contractAddress,
              abi: BetAbi,
              functionName: "settleBet",
              args: ["0x0000000000000000000000000000000000000000", ""],
            },
            { onSuccess: () => toast({ title: "Bet settled successfully" }) },
          )
        }
      >
        Tie
      </Button>
    </>
  );

  return (
    <div className="flex gap-1">
      {account.chainId === 8453 ? (
        <>
          {isCreator && bet.status === "expired" && creatorActions}
          {isParticipant && bet.status === "pending" && participantActions}
          {isJudge && bet.status === "accepted" && judgeActions}
        </>
      ) : (
        "Wrong chain"
      )}
      <span className="hidden only:inline-block">...</span>
    </div>
  );
}
