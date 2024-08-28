"use client";

import Link from "next/link";
import { Badge } from "../ui/badge";
import { WannaBetUser } from "@/lib/types/wb-user";
import { UserAvatar } from "./user-avatar";

export function UserBadge({ user }: { user: WannaBetUser }) {
  return (
    <div className="flex items-center space-x-1">
      <Link href={user.path}>
        <UserAvatar avatar={user.avatar} name={user.name} />
      </Link>
      <Link href={user.path}>
        <Badge variant="outline">{user.name}</Badge>
      </Link>
    </div>
  );
}
