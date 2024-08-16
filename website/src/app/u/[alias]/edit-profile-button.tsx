"use client";

import { Button } from "@/components/ui/button";
import { useActiveWallet } from "@/hooks/useActiveWallet";
import { usePrivy } from "@privy-io/react-auth";
import { Pencil1Icon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Address } from "viem";

export function EditProfileButton({ address }: { address: Address }) {
  const { ready, authenticated } = usePrivy();
  const wallet = useActiveWallet();

  if (!ready || !authenticated || !wallet || wallet.address.toLowerCase() !== address.toLowerCase()) return null;

  return (
    <Button variant="outline" asChild>
      <Link href={`/~/edit-profile`} className="block space-x-2">
        <Pencil1Icon className="-ml-1" />
        <span className="inline-block">Edit Profile</span>
      </Link>
    </Button>
  );
}
