"use client";

import Link from "next/link";
import { LoginButton } from "./auth/login-button";
import { TokenClaimButton } from "@/app/_fun-token/token-claim-button";

export function Header() {
  return (
    <header className="mb-8 flex w-full justify-between px-2 font-semibold md:mb-12 md:px-0">
      <Link href="/" className="text-2xl lg:text-3xl">
        WannaBet 🤝
      </Link>

      <div className="space-x-2">
        <TokenClaimButton />
        <LoginButton />
      </div>
    </header>
  );
}
