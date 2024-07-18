"use client";

import { CreateBetCard } from "@/components/create-bet-card";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default function CreatePage() {
  return (
    <main className="flex w-full flex-col items-center">
      <div className="w-full max-w-md space-y-2">
        <BackButton />
        <CreateBetCard />
      </div>
    </main>
  );
}

function BackButton() {
  return (
    <Button variant="outline" size="icon" asChild>
      <Link href="/">
        <ArrowLeftIcon />
      </Link>
    </Button>
  );
}
