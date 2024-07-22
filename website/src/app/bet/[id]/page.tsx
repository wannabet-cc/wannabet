import { BetDetailsCard } from "@/components/bet-details-card";
import { BackButton } from "@/components/back-button";
import { getFormattedBetFromId } from "@/services/services";

export default async function BetPage({ params }: { params: { id: number } }) {
  const data = await getFormattedBetFromId(params.id);
  return (
    <main className="flex w-full flex-col items-center">
      <div className="w-full space-y-2 md:px-8">
        <BackButton />
        <BetDetailsCard currentBet={data} />
      </div>
    </main>
  );
}
