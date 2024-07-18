"use client";

import Link from "next/link";
import { CustomConnectButton } from "./rainbow/custom-connect-button";

export function Header() {
  return (
    <header className="mb-12 flex w-full justify-between font-semibold">
      <Link href="https://wannabet.cc" className="text-2xl lg:text-3xl">
        WannaBet 🤝
      </Link>

      <CustomConnectButton />
    </header>
  );
}
