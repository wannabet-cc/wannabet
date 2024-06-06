import { TransactionContext } from "frog";
import { FiatTokenProxyAbi } from "../contracts/usdcAbi";
import {
  TESTNET_ARBITRUM_USDC_CONTRACT_ADDRESS,
  TESTNET_BET_FACTORY_CONTRACT_ADDRESS,
} from "../contracts/addresses";
import type { BetInfoState } from "../types";

export const authorize = async (
  c: TransactionContext<{ State: BetInfoState }>
) => {
  const { previousState } = c;
  const usdcAmount = BigInt(previousState.amount * 10 ** 6);
  return c.contract({
    abi: FiatTokenProxyAbi,
    to: TESTNET_ARBITRUM_USDC_CONTRACT_ADDRESS,
    chainId: "eip155:42161",
    functionName: "approve",
    args: [
      TESTNET_BET_FACTORY_CONTRACT_ADDRESS, // spender
      usdcAmount, // value
    ],
  });
};
