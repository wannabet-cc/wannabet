import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SetNamePage() {
  return (
    <main className="flex w-full flex-col items-center">
      <div className="w-full space-y-2 md:px-8">
        <BackButton />
        <SetNameCard />
      </div>
    </main>
  );
}

function SetNameCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p>Set your name to be displayed on the platform.</p>
      </CardContent>
    </Card>
  );
}
