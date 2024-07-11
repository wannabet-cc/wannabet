import { Badge } from "../ui/badge";

export function UserBadge({ userAlias }: { userAlias: string }) {
  return (
    <Badge
      variant={
        userAlias.startsWith("@")
          ? "user-farcaster"
          : userAlias.endsWith(".eth")
            ? "user-ens"
            : "user-address"
      }
    >
      {userAlias}
    </Badge>
  );
}
