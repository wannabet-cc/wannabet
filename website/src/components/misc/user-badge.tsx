"use client";

import Link from "next/link";
import { Badge } from "../ui/badge";
import { WannaBetUser } from "@/lib/types/wb-user";

export function UserBadge({ user }: { user: WannaBetUser }) {
  return (
    <Link href={user.path}>
      <Badge variant={user.name.endsWith(".eth") ? "user-ens" : "user-address"}>{user.name}</Badge>
    </Link>
  );
}
