"use client";

import { LogoutButton } from "@/components/auth/logout-button";
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
