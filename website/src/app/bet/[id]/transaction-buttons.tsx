"use client";

// Types
import type { FormattedBet } from "@/services/api/types";
// Constants
import { FiatTokenProxyAbi } from "@/abis/FiatTokenProxyAbi";
import { BetAbi } from "@/abis/BetAbi";
// Hooks
import { useMutation } from "@tanstack/react-query";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
// Wagmi - Contract Write
import { writeContract } from "@wagmi/core";
import { config } from "@/app/providers";
// Components
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

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
  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: () =>
      writeContract(config, {
        address: props.bet.contractAddress,
        abi: BetAbi,
        functionName: "retrieveTokens",
      }),
  });

  const { data: contractBalance } = useReadContract({
    address: props.bet.token,
    abi: FiatTokenProxyAbi,
    functionName: "balanceOf",
    args: [props.bet.contractAddress],
  });

  return Number(contractBalance) > 0 ? (
    <Button variant="default" size="sm" disabled={isPending || !props.isCreator} onClick={() => mutate()}>
      Retrieve funds
    </Button>
  ) : (
    <Button variant="secondary" size="sm" disabled>
      Funds retrieved
    </Button>
  );
}

function ParticipantActions(props: { isParticipant: boolean; bet: FormattedBet }) {
  const { mutate: mutateAccept, isPending: isPendingAccept } = useMutation({
    mutationFn: async () => {
      await writeContract(config, {
        address: props.bet.token,
        abi: FiatTokenProxyAbi,
        functionName: "approve",
        args: [props.bet.contractAddress, BigInt(props.bet.bigintAmount)],
      });
      writeContract(config, {
        address: props.bet.contractAddress,
        abi: BetAbi,
        functionName: "acceptBet",
      });
    },
  });
  const { mutate: mutateDecline, isPending: isPendingDecline } = useMutation({
    mutationFn: () =>
      writeContract(config, {
        address: props.bet.contractAddress,
        abi: BetAbi,
        functionName: "declineBet",
      }),
  });

  const isPending = isPendingAccept || isPendingDecline;

  return (
    <>
      <Button variant="default" size="sm" disabled={isPending || !props.isParticipant} onClick={() => mutateAccept()}>
        Accept
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled={isPending || !props.isParticipant}
        onClick={() => mutateDecline()}
      >
        Decline
      </Button>
    </>
  );
}

function JudgeActions(props: { isJudge: boolean; bet: FormattedBet }) {
  const { mutate: mutateWinnerOne, isPending: isPendingOne } = useMutation({
    mutationFn: () =>
      writeContract(config, {
        address: props.bet.contractAddress,
        abi: BetAbi,
        functionName: "settleBet",
        args: [props.bet.creator, ""],
      }),
  });
  const { mutate: mutateWinnerTwo, isPending: isPendingTwo } = useMutation({
    mutationFn: () =>
      writeContract(config, {
        address: props.bet.contractAddress,
        abi: BetAbi,
        functionName: "settleBet",
        args: [props.bet.participant, ""],
      }),
  });
  const { mutate: mutateWinnerTie, isPending: isPendingTie } = useMutation({
    mutationFn: () =>
      writeContract(config, {
        address: props.bet.contractAddress,
        abi: BetAbi,
        functionName: "settleBet",
        args: ["0x0000000000000000000000000000000000000000", ""],
      }),
  });

  const isPending = isPendingOne || isPendingTwo || isPendingTie;

  return (
    <>
      <Button variant="default" size="sm" disabled={isPending || !props.isJudge} onClick={() => mutateWinnerOne()}>
        {props.bet.creatorAlias}
      </Button>
      <Button variant="default" size="sm" disabled={isPending || !props.isJudge} onClick={() => mutateWinnerTwo()}>
        {props.bet.participantAlias}
      </Button>
      <Button variant="secondary" size="sm" disabled={isPending || !props.isJudge} onClick={() => mutateWinnerTie()}>
        Tie
      </Button>
    </>
  );
}
