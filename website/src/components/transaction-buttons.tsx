import { type FormattedBet } from "@/services/services";
import { FiatTokenProxyAbi } from "@/abis/FiatTokenProxyAbi";
import { BetAbi } from "@/abis/BetAbi";
import { parseUnits } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

export function TransactionButtons({ bet }: { bet: FormattedBet }) {
  const account = useAccount();
  const { toast } = useToast();
  const { data: contractBalance } = useReadContract({
    address: bet.token,
    abi: FiatTokenProxyAbi,
    functionName: "balanceOf",
    args: [bet.contractAddress],
  });
  const { writeContractAsync, isPending } = useWriteContract();

  const isCreator = account.address?.toLowerCase() === bet.creator,
    isParticipant = account.address?.toLowerCase() === bet.participant,
    isJudge = account.address?.toLowerCase() === bet.judge;

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
            address: bet.token,
            abi: FiatTokenProxyAbi,
            functionName: "approve",
            args: [bet.contractAddress, bet.bigintAmount],
          });
          writeContractAsync(
            {
              address: bet.contractAddress,
              abi: BetAbi,
              functionName: "acceptBet",
              value: parseUnits("0.0002", 18), // 18 decimals for Ether
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
    <div className="flex flex-col space-y-2">
      <div className="flex gap-1 *:flex-1">
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
      {isParticipant && bet.status === "pending" && (
        <div className="text-center text-xs text-muted-foreground">
          * Accepting a bet includes a 0.0002 ether fee
        </div>
      )}
    </div>
  );
}
