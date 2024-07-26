"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAccount, useEnsName } from "wagmi";

export function LoginButton() {
  const { ready, authenticated, login } = usePrivy();
  const { isConnected, address } = useAccount();
  const { data: ensName } = useEnsName({
    address: address,
    chainId: 1,
    query: { enabled: isConnected },
  });

  if (ready && authenticated) {
    return (
      <Button asChild variant="outline">
        <Link href={"/account"}>{ensName}</Link>
      </Button>
    );
  }

  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);

  if (!authenticated) {
    return (
      <Button disabled={disableLogin} onClick={login}>
        Sign In
      </Button>
    );
  }
}
