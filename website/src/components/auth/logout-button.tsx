"use client";

import { usePrivy } from "@privy-io/react-auth";
import { Button } from "../ui/button";

export function LogoutButton() {
  const { ready, authenticated, logout } = usePrivy();

  // Disable logout when Privy is not ready or the user is not authenticated
  const disableLogout = !ready || (ready && !authenticated);

  return (
    <Button variant="destructive" onClick={logout} disabled={disableLogout}>
      Log out
    </Button>
  );
}
