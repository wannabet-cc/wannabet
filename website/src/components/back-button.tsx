"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export function BackButton() {
  const router = useRouter();
  return (
    <Button variant="outline" size="icon" asChild>
      <Link
        href="#"
        onClick={(e) => {
          e.preventDefault();
          router.back();
        }}
      >
        <ArrowLeftIcon />
      </Link>
    </Button>
  );
}
