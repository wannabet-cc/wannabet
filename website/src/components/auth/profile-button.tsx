"use client";

import { useLogout, usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { NaiveSignInButton } from "./sign-in-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { base } from "viem/chains";
import Link from "next/link";
import { abbreviateHex } from "@/utils";
import { Address } from "viem";
import { TokenClaimButton } from "@/app/_fun-token/token-claim-button";

export function ProfileButton() {
  const { ready, authenticated } = usePrivy();
  const wallet = useActiveWallet();

  if (!ready) {
    return (
      <Button disabled variant="outline">
        Loading...
      </Button>
    );
  }

  if (!authenticated || !wallet) {
    return <NaiveSignInButton />;
  }

  if (wallet.chainId !== `eip155:${base.id}`) {
    return (
      <Button
        variant="default"
        onClick={() => {
          wallet.switchChain(base.id);
        }}
      >
        Switch to Base
      </Button>
    );
  }

  return (
    <div className="flex space-x-2">
      <TokenClaimButton />
      <ProfileDropdown user={wallet.address} />
    </div>
  );
}

function ProfileDropdown({ user }: { user: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{abbreviateHex(user as Address, 3)}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/u/${user}`}>My Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/account`}>Account Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownSignOutButton />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function DropdownSignOutButton() {
  const { logout } = useLogout();
  return <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>;
}
