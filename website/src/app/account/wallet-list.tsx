"use client";

import { useSetActiveWallet } from "@privy-io/wagmi";
import { ConnectedWallet, useWallets } from "@privy-io/react-auth";
import { Badge } from "@/components/ui/badge";
import { abbreviateHex, formatUSDC } from "@/lib/utils";
import { Address, Hex } from "viem";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useReadContract } from "wagmi";
import { FiatTokenProxyAbi } from "@/abis/FiatTokenProxyAbi";
import { BASE_USDC_ADDRESS } from "@/config";
import { Button } from "@/components/ui/button";

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
            <TableHead>USD</TableHead>
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
  // get wallet name
  // get wallet usdc balance
  const { data: balance, isSuccess } = useReadContract({
    abi: FiatTokenProxyAbi,
    address: BASE_USDC_ADDRESS,
    functionName: "balanceOf",
    args: [wallet.address as Address],
  });
  // get active status
  const { setActiveWallet } = useSetActiveWallet();
  const active = wallet.linked;
  return (
    <TableRow>
      <TableCell>{}</TableCell>
      <TableCell>
        {isSuccess && balance && `$${formatUSDC(balance, 2)}`}
      </TableCell>
      <TableCell>{abbreviateHex(wallet.address as Hex, 4)}</TableCell>
      <TableCell>{wallet.walletClientType}</TableCell>
      <TableCell className="text-center">
        {active ? (
          <Badge>Active</Badge>
        ) : (
          <Button
            variant="secondary"
            size="xs"
            onClick={async () => {
              await setActiveWallet(wallet);
            }}
          >
            Inactive
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
