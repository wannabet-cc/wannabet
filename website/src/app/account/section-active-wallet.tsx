"use client";

// Types
import { type Address } from "viem";

// Hooks
import { useAccount, useReadContract } from "wagmi";
import { type ConnectedWallet, useWallets } from "@privy-io/react-auth";

// Components
import { Button } from "@/components/ui/button";

// Utility Functions
import { formatUSDC } from "@/utils";

// Contract
import { FiatTokenProxyAbi } from "@/abis/FiatTokenProxyAbi";
import { baseContracts } from "@/lib";

export function SectionActiveWallet() {
  const { wallets } = useWallets();
  const { address, isConnected, isConnecting, isDisconnected } = useAccount();
  const { data: balance, isPending } = useReadContract({
    abi: FiatTokenProxyAbi,
    address: baseContracts.getAddressFromName("USDC")!,
    functionName: "balanceOf",
    args: [address as Address],
  });

  const activeWallet = wallets.find((wallet) => wallet.address === address);

  return (
    <section className="space-y-2 text-sm *:space-x-2">
      <h4 className="mb-4 font-semibold">Active Wallet</h4>
      <p className="flex items-center">
        <span>Address: </span>
        <span className="select-all text-foreground/60">{address}</span>
      </p>
      <p className="flex items-center">
        <span>Connection status: </span>
        {isConnecting && <span>🟡 Connecting...</span>}
        {isConnected && <span>🟢 Connected</span>}
        {isDisconnected && <span> 🔴 Disconnected</span>}
      </p>
      <p className="flex items-center">
        <span>Balance: </span>
        <span>{isPending ? "loading..." : balance ? `$${formatUSDC(balance, 2)}` : "$0.00"}</span>
      </p>
      <AddFundsButton wallet={activeWallet!} />
    </section>
  );
}

function AddFundsButton({ wallet }: { wallet: ConnectedWallet }) {
  return (
    <Button onClick={() => wallet.fund()} disabled={wallet === undefined}>
      Fund Account
    </Button>
  );
}
