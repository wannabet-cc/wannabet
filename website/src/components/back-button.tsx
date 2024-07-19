import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export function BackButton() {
  return (
    <Button variant="outline" size="icon" asChild>
      <Link href="/">
        <ArrowLeftIcon />
      </Link>
    </Button>
  );
}
