"use client";

import { useLogout } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  const { logout } = useLogout({
    onSuccess: () => {
      router.replace("/");
    },
  });
  return (
    <Button variant="outline" onClick={logout}>
      Sign out
    </Button>
  );
}
