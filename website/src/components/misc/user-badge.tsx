import { Badge } from "../ui/badge";

export function UserBadge({ userAlias }: { userAlias: string }) {
  return userAlias.startsWith("@") ? (
    <a href={`https://warpcast.com/${userAlias.slice(1)}`} target="_blank">
      <Badge variant="user-farcaster">{userAlias}</Badge>
    </a>
  ) : userAlias.endsWith(".eth") ? (
    <a href={`https://app.ens.domains/${userAlias}`} target="_blank">
      <Badge variant="user-ens">{userAlias}</Badge>
    </a>
  ) : (
    <Badge variant="user-address">{userAlias}</Badge>
  );
}
