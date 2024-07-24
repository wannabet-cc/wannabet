"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { abbreviateHex } from "@/lib/utils";
import { useWallets } from "@privy-io/react-auth";
import { Hex } from "viem";

export function WalletList() {
  const { ready, wallets } = useWallets();

  if (!ready) <></>;

  return (
    <section className="space-y-2 text-sm">
      <h4 className="mb-4 font-semibold">Wallet List</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Type</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wallets.map((wallet, i) => {
            // get name from address here
            const active = i === 0;
            return (
              <TableRow key={i}>
                <TableCell>{}</TableCell>
                <TableCell>{abbreviateHex(wallet.address as Hex, 4)}</TableCell>
                <TableCell>{wallet.walletClientType}</TableCell>
                <TableCell className="text-center">
                  {active ? (
                    <Badge>Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </section>
  );
}
