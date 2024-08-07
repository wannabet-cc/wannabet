"use client";

import { type FormattedBet } from "@/services/services";
import { FiatTokenProxyAbi } from "@/abis/FiatTokenProxyAbi";
import { BetAbi } from "@/abis/BetAbi";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function TransactionButtons({ bet }: { bet: FormattedBet }) {
  const account = useAccount();

  const isCreator = account.address?.toLowerCase() === bet.creator,
    isParticipant = account.address?.toLowerCase() === bet.participant,
    isJudge = account.address?.toLowerCase() === bet.judge;

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex gap-1 *:flex-1">
        {account.chainId === 8453 ? (
          <Tooltip>
            <TooltipTrigger className="flex gap-1 *:flex-1">
              <div className="flex gap-1 *:flex-1">
                {bet.status === "expired" && <CreatorActions isCreator={isCreator} bet={bet} />}
                {bet.status === "pending" && <ParticipantActions isParticipant={isParticipant} bet={bet} />}
                {bet.status === "accepted" && <JudgeActions isJudge={isJudge} bet={bet} />}
                {bet.status === "declined" && <>...</>}
                {bet.status === "settled" && <>...</>}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {bet.status === "expired" && !isCreator && "Only creator can retrieve funds"}
              {bet.status === "pending" && !isParticipant && "Waiting on participant to accept the bet"}
              {bet.status === "accepted" && !isJudge && <p>Waiting on judge to settle the bet</p>}
            </TooltipContent>
          </Tooltip>
        ) : (
          "Wrong chain"
        )}
      </div>
    </div>
  );
}

function CreatorActions(props: { isCreator: boolean; bet: FormattedBet }) {
  const { writeContractAsync, isPending } = useWriteContract();
  const { data: contractBalance } = useReadContract({
    address: props.bet.token,
    abi: FiatTokenProxyAbi,
    functionName: "balanceOf",
    args: [props.bet.contractAddress],
  });
  const { toast } = useToast();

  return Number(contractBalance) > 0 ? (
    <Button
      variant="default"
      size="sm"
      disabled={isPending || !props.isCreator}
      onClick={() =>
        writeContractAsync(
          {
            address: props.bet.contractAddress,
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
}

function ParticipantActions(props: { isParticipant: boolean; bet: FormattedBet }) {
  const { writeContractAsync, isPending } = useWriteContract();
  const { toast } = useToast();

  return (
    <>
      <Button
        variant="default"
        size="sm"
        disabled={isPending || !props.isParticipant}
        onClick={async () => {
          await writeContractAsync({
            address: props.bet.token,
            abi: FiatTokenProxyAbi,
            functionName: "approve",
            args: [props.bet.contractAddress, BigInt(props.bet.bigintAmount)],
          });
          writeContractAsync(
            {
              address: props.bet.contractAddress,
              abi: BetAbi,
              functionName: "acceptBet",
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
        disabled={isPending || !props.isParticipant}
        onClick={() =>
          writeContractAsync(
            {
              address: props.bet.contractAddress,
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
}

function JudgeActions(props: { isJudge: boolean; bet: FormattedBet }) {
  const { writeContractAsync, isPending } = useWriteContract();
  const { toast } = useToast();

  return (
    <>
      <Button
        variant="default"
        size="sm"
        disabled={isPending || !props.isJudge}
        onClick={() =>
          writeContractAsync(
            {
              address: props.bet.contractAddress,
              abi: BetAbi,
              functionName: "settleBet",
              args: [props.bet.creator, ""],
            },
            { onSuccess: () => toast({ title: "Bet settled successfully" }) },
          )
        }
      >
        {props.bet.creatorAlias}
      </Button>
      <Button
        variant="default"
        size="sm"
        disabled={isPending || !props.isJudge}
        onClick={() =>
          writeContractAsync(
            {
              address: props.bet.contractAddress,
              abi: BetAbi,
              functionName: "settleBet",
              args: [props.bet.participant, ""],
            },
            { onSuccess: () => toast({ title: "Bet settled successfully" }) },
          )
        }
      >
        {props.bet.participantAlias}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled={isPending || !props.isJudge}
        onClick={() =>
          writeContractAsync(
            {
              address: props.bet.contractAddress,
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
}
