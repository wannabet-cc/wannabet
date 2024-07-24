"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ContactInformation } from "./contact-information";
import { WalletList } from "./wallet-list";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import ActionsSection from "./actions-section";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "@/components/back-button";
import { LogoutButton } from "@/components/auth/logout-button";

export default function AccountPage() {
  const { user, ready, authenticated } = usePrivy();
  const router = useRouter();

  if (ready && !authenticated) router.push("/");
  if (!user) <></>;

  return (
    <main className="flex w-full flex-col items-center">
      <div className="w-full space-y-2 md:px-8">
        <BackButton />
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ContactInformation />
            <WalletList />
          </CardContent>
          <CardFooter>
            <LogoutButton />
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
