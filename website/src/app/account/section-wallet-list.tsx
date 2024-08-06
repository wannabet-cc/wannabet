"use client";

// Types
import { Address, type Hex } from "viem";

// Hooks
import { useSetActiveWallet } from "@privy-io/wagmi";
import { type ConnectedWallet, useWallets } from "@privy-io/react-auth";
import { useAccount } from "wagmi";

// Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Utility Functions
import { abbreviateHex } from "@/utils";
import { useFetchEns } from "@/hooks";

export function SectionWalletList() {
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
          {wallets.map((wallet, i) => (
            <WalletRow wallet={wallet} key={i} />
          ))}
        </TableBody>
      </Table>
    </section>
  );
}

function WalletRow({ wallet }: { wallet: ConnectedWallet }) {
  const { setActiveWallet } = useSetActiveWallet();
  const { address } = useAccount();

  const { data: ensRes, isSuccess, isLoading } = useFetchEns(wallet.address as Address);

  const active = wallet.address === address;

  return (
    <TableRow>
      <TableCell>{isSuccess && ensRes && ensRes.name}</TableCell>
      <TableCell>{abbreviateHex(wallet.address as Hex, 4)}</TableCell>
      <TableCell>{wallet.walletClientType}</TableCell>
      <TableCell className="text-center">
        {active ? (
          <Badge>Active</Badge>
        ) : (
          <Button
            variant="secondary"
            size="xs"
            onClick={() => {
              setActiveWallet(wallet);
            }}
          >
            Set as active
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
