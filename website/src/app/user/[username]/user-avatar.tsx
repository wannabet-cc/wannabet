"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAvatar(props: { avatar: string; name: string }) {
  return (
    <Avatar>
      <AvatarImage src={props.avatar} />
      <AvatarFallback>{props.name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
