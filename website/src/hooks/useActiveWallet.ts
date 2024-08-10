import { useWallets } from "@privy-io/react-auth";
import { useAccount } from "wagmi";

/** Get the active privy wallet */
export function useActiveWallet() {
  const { wallets } = useWallets();
  const { address } = useAccount();

  const activeWallet = wallets.find((wallet) => wallet.address === address);

  return activeWallet;
}
