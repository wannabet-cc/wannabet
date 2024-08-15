import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import React from "react";
import { UserBets } from "./user-bets";
import { UserAvatar } from "@/components/misc/user-avatar";
import { UserResolver } from "@/lib/wb-user-resolver";
import { WannaBetUser } from "@/lib/types/wb-user";

export default async function UserPage({ params }: { params: { alias: string } }) {
  const user = await UserResolver.getPreferredUser(params.alias);

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

function ProfileCard({ user }: { user: WannaBetUser }) {
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
