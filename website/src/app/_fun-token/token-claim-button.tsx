"use client";

// Hooks
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useAccount } from "wagmi";
import { useMutation, useQuery } from "@tanstack/react-query";

// Components
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Contract Imports
import type { Address } from "viem";
import { checkIfWhitelisted, getLastMintTime, handleClaim } from "./wallet-functions";

export function TokenClaimButton() {
  const { ready, authenticated } = usePrivy();
  const { address, connector } = useAccount();

  const { data: isWhitelisted, isLoading } = useQuery({
    queryKey: ["isWhitelisted", address],
    queryFn: () => checkIfWhitelisted(address!),
    enabled: !!address && !connector?.name.startsWith("Privy"),
  });

  if (!ready || !authenticated || !address || connector?.name.startsWith("Privy")) return <></>;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" disabled={isLoading}>
          Claim JFF Tokens
        </Button>
      </DialogTrigger>
      {isWhitelisted ? <WhitelistedDialog address={address} /> : <NotWhitelistedDialog />}
    </Dialog>
  );
}

function WhitelistedDialog({ address }: { address: Address }) {
  const { data: lastMintTime } = useQuery({
    queryKey: ["lastMintTime", address],
    queryFn: () => getLastMintTime(address),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      handleClaim([
        ["isWhitelisted", address],
        ["lastMintTime", address],
      ]),
  });

  const timeLeft = Math.round(Number(lastMintTime) + 86400 - Date.now() / 1000);
  const inCooldown = timeLeft >= 0;

  return (
    <DialogContent aria-describedby="Just for fun token whitelist dialog">
      <DialogHeader>
        <DialogTitle>
          Congrats! {inCooldown ? "You have claimed your daily amount" : "You are on the whitelist for the JFF token."}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4 text-sm text-muted-foreground">
        {inCooldown ? (
          <p>Come back tomorrow to claim 100 more.</p>
        ) : (
          <p>JFF (i.e. &quot;Just for fun&quot;) tokens can be used on WannaBet to try the app out without risk.</p>
        )}
      </div>
      <DialogFooter>
        <Button className="w-full" disabled={inCooldown || isPending} onClick={() => mutate()}>
          {inCooldown ? (
            <CountdownButtonText lastMintTime={Number(lastMintTime)} />
          ) : isPending ? (
            "Claiming..."
          ) : (
            "Claim"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function CountdownButtonText({ lastMintTime }: { lastMintTime: number }) {
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const intervalId = setInterval(() => forceUpdate({}), 1000);
    return () => clearInterval(intervalId);
  }, []);
  const timeLeft = Math.round(lastMintTime + 86400 - Date.now() / 1000);
  return <>{`Cooling down... Come back in ${timeLeft} seconds`}</>;
}

function NotWhitelistedDialog() {
  return (
    <DialogContent aria-describedby="Just for fun token whitelist dialog">
      <DialogHeader>
        <DialogTitle>You aren&apos;t on the whitelist for JFF</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 text-sm text-muted-foreground">
        <p>JFF (i.e. &quot;Just for fun&quot;) tokens can be used on WannaBet to try the app out without risk.</p>
        <p>To get added, join our telegram group and ask @limes_eth</p>
      </div>
      <DialogFooter>
        <Button className="w-full" asChild>
          <a href="https://t.me/wannabettt" target="_blank">
            Join Telegram Group
          </a>
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
