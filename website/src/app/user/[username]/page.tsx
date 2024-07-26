import { BackButton } from "@/components/back-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchEns } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { normalize } from "viem/ens";
import { UserBets } from "./user-bets";
import { UserAvatar } from "./user-avatar";
import { GearIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";

const ensRegex = /^.{3,}\.eth$/; // /^[a-z0-9]+\.eth$/;

export default async function UserPage({
  params,
}: {
  params: { username: string };
}) {
  // Namestone

  // ENS
  if (ensRegex.test(params.username)) {
    const account = await fetchEns(
      normalize(params.username) as `${string}.eth`,
    );
    return (
      <main className="flex w-full flex-col items-center">
        <div className="w-full space-y-2 md:px-8">
          <BackButton />
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center space-x-2">
                  <UserAvatar avatar={account.avatar} name={account.name} />
                  <p>{account.name}</p>
                </div>
                <Button asChild variant="outline" size="icon">
                  <Link href="/account">
                    <GearIcon />
                  </Link>
                </Button>
              </CardTitle>
              {/* <CardDescription>Joined ...</CardDescription> */}
            </CardHeader>
            <CardContent>
              <UserBets address={account.address} />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Fallback
  return (
    <main className="flex w-full flex-col items-center">
      <div className="w-full space-y-2 md:px-8">
        <BackButton />
        <MissingProfileCard />
      </div>
    </main>
  );
}

function MissingProfileCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          Sorry, we couldn&apos;t find who you&apos;re looking for
        </CardTitle>
        <CardDescription>
          <Link href={"/"}>Go home?</Link>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4"></CardContent>
    </Card>
  );
}
