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
import { useQuery } from "@tanstack/react-query";
import { WannaBetUser } from "@/lib/types/wb-user";
import { useMemo } from "react";

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
      <NamedProfileDropdown address={wallet.address as Address} />
    </div>
  );
}

function NamedProfileDropdown({ address }: { address: Address }) {
  const { data, isSuccess } = useQuery({
    queryKey: ["user", address],
    queryFn: async () => {
      const res = await fetch(`/api/names/${address}`);
      if (!res.ok) {
        throw new Error("Network response was not ok");
      }
      const json = await res.json();
      return json.data as WannaBetUser;
    },
  });

  const user = useMemo(() => {
    return isSuccess && data
      ? data
      : ({
          type: "Address",
          name: abbreviateHex(address),
          address: address as Address,
          path: `/u/${address}`,
        } satisfies WannaBetUser);
  }, [isSuccess, data, address]);

  return <ProfileDropdown user={user} />;
}

function ProfileDropdown({ user }: { user: WannaBetUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{user.name}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={user.path}>My Profile</Link>
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
