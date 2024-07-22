import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CreateBetForm } from "./create-bet-form";

export function CreateBetCard() {
  return (
    <Card className="w-full" id="create">
      <CardHeader>
        <CardTitle className="text-lg">Start a new bet</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <CreateBetForm />
      </CardContent>
    </Card>
  );
}
