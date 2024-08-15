"use client";

import { useLogin, usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  const { ready, authenticated } = usePrivy();
  if (!ready) {
    return (
      <Button disabled variant="outline">
        Loading...
      </Button>
    );
  }

  if (!authenticated) {
    return <NaiveSignInButton />;
  }

  return null;
}

export function NaiveSignInButton() {
  const { login } = useLogin({
    onComplete: (user, isNewUser) => {
      // Ask new users if they want a wannabet subname
    },
  });
  return <Button onClick={login}>Connect & Sign</Button>;
}
