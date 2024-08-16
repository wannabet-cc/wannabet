import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EditProfileForm from "./edit-profile-form";

export default function EditProfilePage() {
  return (
    <main className="flex w-full flex-col items-center">
      <div className="w-full max-w-md space-y-2 md:px-8">
        <BackButton />
        <EditProfileCard />
      </div>
    </main>
  );
}

function EditProfileCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Set Name</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <EditProfileForm currentName="" />
      </CardContent>
    </Card>
  );
}
