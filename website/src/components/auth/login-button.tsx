"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAccount, useEnsName } from "wagmi";
import { abbreviateHex } from "@/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

export function LoginButton() {
  const { ready, authenticated, login, logout } = usePrivy();
  const { isConnected, address } = useAccount();
  const { data: ensName } = useEnsName({
    address: address,
    chainId: 1,
    query: { enabled: isConnected },
  });

  if (ready && authenticated && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{ensName ? ensName : abbreviateHex(address, 3)}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/user/${ensName}`}>My Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/account`}>Account Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
