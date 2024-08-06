// Components
import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionContactInformation } from "./section-contact-information";
import { SectionWalletList } from "./section-wallet-list";
import { SectionActiveWallet } from "./section-active-wallet";
import { LogoutButton } from "@/components/auth/logout-button";

export default function AccountPage() {
  return (
    <main className="flex w-full flex-col items-center">
      <div className="w-full space-y-2 md:px-8">
        <BackButton />
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <SectionContactInformation />
            <SectionWalletList />
            <SectionActiveWallet />
          </CardContent>
          <CardFooter className="pt-12">
            <LogoutButton />
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
