"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const { ready, authenticated, logout } = usePrivy();
  const router = useRouter();

  if (ready && !authenticated) router.push("/");

  return (
    <Button variant="destructive" onClick={logout} disabled={!ready}>
      Log out
    </Button>
  );
}
