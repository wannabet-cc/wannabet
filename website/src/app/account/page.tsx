// Components
import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactInformation } from "./contact-information";
import { WalletList } from "./wallet-list";
import { ActiveWallet } from "./active-wallet";
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
            <ContactInformation />
            <WalletList />
            <ActiveWallet />
          </CardContent>
          <CardFooter className="pt-12">
            <LogoutButton />
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
