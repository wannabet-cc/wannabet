import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function CreateBetCard() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Start a new bet</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4"></CardContent>
    </Card>
  );
}
