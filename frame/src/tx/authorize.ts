import { TransactionContext } from "frog";
import { FiatTokenProxyAbi } from "../contracts/usdcAbi";
import {
  ARBITRUM_USDC_CONTRACT_ADDRESS,
  BET_FACTORY_CONTRACT_ADDRESS,
} from "../contracts/addresses";
import type { BetInfoState } from "../types";

export const authorize = async (
  c: TransactionContext<{ State: BetInfoState }>
) => {
  const { previousState } = c;
  const usdcAmount = BigInt(previousState.amount * 10 ** 6);
  return c.contract({
    abi: FiatTokenProxyAbi,
    to: ARBITRUM_USDC_CONTRACT_ADDRESS,
    chainId: "eip155:42161",
    functionName: "approve",
    args: [
      BET_FACTORY_CONTRACT_ADDRESS, // spender
      usdcAmount, // value
    ],
  });
};
