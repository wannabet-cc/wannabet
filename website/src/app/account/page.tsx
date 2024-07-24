"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactInformation } from "./contact-information";
import { WalletList } from "./wallet-list";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import ActionsSection from "./actions-section";
import { Separator } from "@/components/ui/separator";

export default function AccountPage() {
  const { user, ready, authenticated } = usePrivy();
  const router = useRouter();

  if (ready && !authenticated) router.push("/");
  if (!user) <></>;

  return (
    <main className="flex w-full flex-col items-center md:px-8">
      <AccountCard>
        <ContactInformation />
        <WalletList />
        <Separator />
        <ActionsSection />
      </AccountCard>
    </main>
  );
}

function AccountCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );
}
