"use client";

// Types
import type { FormattedBet } from "@/services/api/types";
// Constants
import { FiatTokenProxyAbi } from "@/abis/FiatTokenProxyAbi";
// Hooks
import { useMutation } from "@tanstack/react-query";
import { useAccount, useReadContract } from "wagmi";
// Components
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
// Wallet Functions
import { acceptBet, declineBet, retrieveTokens, settleBet } from "@/lib/wallet-functions";
import { base } from "viem/chains";
import { Address } from "viem";
// General
import { revalidatePath } from "next/cache";

export function TransactionButtons({ bet }: { bet: FormattedBet }) {
  const { address } = useAccount();

  const isCreator = address?.toLowerCase() === bet.creator,
    isParticipant = address?.toLowerCase() === bet.participant,
    isJudge = address?.toLowerCase() === bet.judge;

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex gap-1 *:flex-1">
        <Tooltip>
          <TooltipTrigger className="flex gap-1 *:flex-1">
            <div className="flex gap-1 *:flex-1">
              {bet.status === "expired" && <CreatorActions isCreator={isCreator} bet={bet} />}
              {bet.status === "pending" && (
                <ParticipantActions address={address} isParticipant={isParticipant} bet={bet} />
              )}
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
      </div>
    </div>
  );
}

function CreatorActions({ isCreator, bet }: { isCreator: boolean; bet: FormattedBet }) {
  const { mutate, isPending } = useMutation({
    mutationFn: () => retrieveTokens(bet.contractAddress),
    onSuccess: () => revalidatePath(`/bet/${bet.betId}`),
  });

  const { data: contractBalance } = useReadContract({
    address: bet.token,
    abi: FiatTokenProxyAbi,
    functionName: "balanceOf",
    args: [bet.contractAddress],
    chainId: base.id,
  });

  return Number(contractBalance) > 0 ? (
    <Button variant="default" size="sm" disabled={isPending || !isCreator} onClick={() => mutate()}>
      Retrieve funds
    </Button>
  ) : (
    <Button variant="secondary" size="sm" disabled>
      Funds retrieved
    </Button>
  );
}

function ParticipantActions({
  address,
  isParticipant,
  bet,
}: {
  address?: Address;
  isParticipant: boolean;
  bet: FormattedBet;
}) {
  const { mutate: mutateAccept, isPending: isPendingAccept } = useMutation({
    mutationFn: () => acceptBet(address!, bet.contractAddress, bet.token, BigInt(bet.bigintAmount)),
    onSuccess: () => revalidatePath(`/bet/${bet.betId}`),
  });
  const { mutate: mutateDecline, isPending: isPendingDecline } = useMutation({
    mutationFn: () => declineBet(bet.contractAddress),
    onSuccess: () => revalidatePath(`/bet/${bet.betId}`),
  });

  const isPending = isPendingAccept || isPendingDecline;

  return (
    <>
      <Button
        variant="default"
        size="sm"
        disabled={!address || isPending || !isParticipant}
        onClick={() => mutateAccept()}
      >
        Accept
      </Button>
      <Button variant="secondary" size="sm" disabled={isPending || !isParticipant} onClick={() => mutateDecline()}>
        Decline
      </Button>
    </>
  );
}

function JudgeActions({ isJudge, bet }: { isJudge: boolean; bet: FormattedBet }) {
  const { mutate: mutateSettleForCreator, isPending: isPendingCreator } = useMutation({
    mutationFn: () => settleBet(bet.contractAddress, bet.creator),
    onSuccess: () => revalidatePath(`/bet/${bet.betId}`),
  });
  const { mutate: mutateSettleForParticipant, isPending: isPendingParticipant } = useMutation({
    mutationFn: () => settleBet(bet.contractAddress, bet.participant),
    onSuccess: () => revalidatePath(`/bet/${bet.betId}`),
  });
  const { mutate: mutateSettleTie, isPending: isPendingTie } = useMutation({
    mutationFn: () => settleBet(bet.contractAddress, "0x0000000000000000000000000000000000000000"),
    onSuccess: () => revalidatePath(`/bet/${bet.betId}`),
  });

  const isPending = isPendingCreator || isPendingParticipant || isPendingTie;

  return (
    <>
      <Button variant="default" size="sm" disabled={isPending || !isJudge} onClick={() => mutateSettleForCreator()}>
        {bet.creatorAlias}
      </Button>
      <Button variant="default" size="sm" disabled={isPending || !isJudge} onClick={() => mutateSettleForParticipant()}>
        {bet.participantAlias}
      </Button>
      <Button variant="secondary" size="sm" disabled={isPending || !isJudge} onClick={() => mutateSettleTie()}>
        Tie
      </Button>
    </>
  );
}
