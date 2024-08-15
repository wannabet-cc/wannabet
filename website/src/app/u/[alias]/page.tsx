import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchEns } from "@/lib";
import Link from "next/link";
import React from "react";
import { normalize } from "viem/ens";
import { UserBets } from "./user-bets";
import { UserAvatar } from "./user-avatar";
import { nameStone_NameSchema } from "@/lib/types/namestone";
import { nameStoneService } from "@/services/namestone";
import { ensSchema } from "@/lib/types";
import { WBUser } from "@/lib/types/user";
import { UserResolver } from "@/lib/user-resolver";

export default async function UserPage({ params }: { params: { alias: string } }) {
  const user = await UserResolver.getUser(params.alias);

  if (user) {
    return (
      <main className="flex w-full flex-col items-center">
        <div className="w-full space-y-2 md:px-8">
          <BackButton />
          <ProfileCard user={user} />
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

function ProfileCard({ user }: { user: WBUser }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <UserAvatar avatar={user.avatar} name={user.name} />
            <p>{user.name}</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <UserBets address={user.address} />
      </CardContent>
    </Card>
  );
}

function MissingProfileCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Sorry, we couldn&apos;t find who you&apos;re looking for</CardTitle>
        <CardDescription>
          <Link href={"/"}>Go home?</Link>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4"></CardContent>
    </Card>
  );
}
