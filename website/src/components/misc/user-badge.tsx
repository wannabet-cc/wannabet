import Link from "next/link";
import { Badge } from "../ui/badge";

export function UserBadge({ userAlias }: { userAlias: string }) {
  return (
    <Link href={`/u/${userAlias}`}>
      <Badge variant={userAlias.endsWith(".eth") ? "user-ens" : "user-address"}>{userAlias}</Badge>
    </Link>
  );
}
