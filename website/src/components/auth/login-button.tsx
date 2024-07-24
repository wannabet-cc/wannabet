import { usePrivy } from "@privy-io/react-auth";
import { Button } from "../ui/button";
import Link from "next/link";

export function LoginButton() {
  const { ready, authenticated, user, login } = usePrivy();

  if (ready && authenticated) {
    return (
      <Button asChild variant="outline">
        <Link href={"/account"}>{user?.id}</Link>
      </Button>
    );
  }

  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);

  if (!authenticated) {
    return (
      <Button disabled={disableLogin} onClick={login}>
        Sign In
      </Button>
    );
  }
}
