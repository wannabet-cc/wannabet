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
import { Address } from "viem";
import { ensSchema } from "@/lib/types";

type User = {
  name: string;
  address: Address;
  avatar?: string;
};

export default async function UserPage({ params }: { params: { username: string } }) {
  // Namestone
  const validatedName = nameStone_NameSchema.safeParse(params.username);
  if (validatedName.success) {
    const res = await nameStoneService.searchName(validatedName.data, 1);
    if (res.length > 0 && res[0].name === validatedName.data) {
      const user: User = {
        name: res[0].name,
        address: res[0].address,
        avatar: res[0].text_records && res[0].text_records.avatar,
      };
      return (
        <main className="flex w-full flex-col items-center">
          <div className="w-full space-y-2 md:px-8">
            <BackButton />
            <ProfileCard user={user} />
          </div>
        </main>
      );
    }
  }

  // ENS
  const validatedEnsName = ensSchema.safeParse(params.username);
  if (validatedEnsName.success) {
    const account = await fetchEns(normalize(params.username) as `${string}.eth`);
    if (account.address) {
      const user: User = { name: params.username, address: account.address, avatar: account.avatar || undefined };
      return (
        <main className="flex w-full flex-col items-center">
          <div className="w-full space-y-2 md:px-8">
            <BackButton />
            <ProfileCard user={user} />
          </div>
        </main>
      );
    }
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

function ProfileCard({ user }: { user: User }) {
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
