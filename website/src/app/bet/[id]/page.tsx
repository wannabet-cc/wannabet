import { getFormattedBetFromId, getMostRecentBetId } from "@/services/services";
import { type FormattedBet } from "@/services/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/back-button";
import { BetDetails } from "@/components/bet-details";

// export async function generateStaticParams() {
//   const mostRecentBetId = await getMostRecentBetId();
//   return Array.from({ length: mostRecentBetId }, (_, index) => ({
//     id: (index + 1).toString(),
//   }));
// }

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

function BetDetailsCard({ currentBet }: { currentBet: FormattedBet | undefined }) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">
          {currentBet ? `Bet #${currentBet.betId}` : "Select a bet"}
        </CardTitle>
        <CardDescription>
          {currentBet ? (
            <a href={`https://basescan.org/address/${currentBet.contractAddress}`} target="_blank">
              See on Basescan
            </a>
          ) : (
            ""
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {currentBet && <BetDetails bet={currentBet} />}
      </CardContent>
    </Card>
  );
}
