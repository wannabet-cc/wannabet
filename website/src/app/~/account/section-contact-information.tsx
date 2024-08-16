"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";

export function SectionContactInformation() {
  const { ready, authenticated, user, linkEmail, linkPhone } = usePrivy();

  return (
    <section className="space-y-2 text-sm">
      <h4 className="mb-4 font-semibold">Contact Information</h4>
      <p className="text-muted-foreground">
        Email:{" "}
        {user && (
          <span>
            {user.email ? (
              user.email.address
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={linkEmail}
                disabled={!ready || !authenticated}
              >
                Add email
              </Button>
            )}
          </span>
        )}
      </p>
      <p className="text-muted-foreground">
        Phone:{" "}
        {user && (
          <span>
            {user.phone ? (
              user.phone.number
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={linkPhone}
                disabled={!ready || !authenticated}
              >
                Add phone number
              </Button>
            )}
          </span>
        )}
      </p>
    </section>
  );
}
