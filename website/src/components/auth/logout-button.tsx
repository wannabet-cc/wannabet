"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button } from "../ui/button";

export function LogoutButton() {
  const { ready, authenticated, logout } = usePrivy();

  if (ready && authenticated) <></>;

  return (
    <Button variant="destructive" onClick={logout}>
      Log out
    </Button>
  );
}
