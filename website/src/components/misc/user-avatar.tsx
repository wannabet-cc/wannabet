"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/utils";

export function UserAvatar(props: { avatar?: string; name: string; size?: number }) {
  return (
    <Avatar>
      <AvatarImage src={props.avatar} className={cn(`h-${props.size} w-${props.size}`)} />
      <AvatarFallback>{props.name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
