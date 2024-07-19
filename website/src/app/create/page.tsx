import { CreateBetCard } from "@/components/create-bet-card";
import { BackButton } from "@/components/back-button";

export default function CreatePage() {
  return (
    <main className="flex w-full flex-col items-center">
      <div className="w-full max-w-md space-y-2">
        <BackButton />
        <CreateBetCard />
      </div>
    </main>
  );
}
