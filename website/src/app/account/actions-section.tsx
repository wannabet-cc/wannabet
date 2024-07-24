"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";

export default function ActionsSection() {
  const { ready, authenticated, logout } = usePrivy();

  if (ready && authenticated) <></>;

  return (
    <section>
      <div className="flex justify-end">
        <LogoutButton />
      </div>
    </section>
  );
}

function LogoutButton() {
  const { ready, authenticated, logout } = usePrivy();

  if (ready && authenticated) <></>;

  return (
    <Button variant="destructive" onClick={logout}>
      Log out
    </Button>
  );
}
