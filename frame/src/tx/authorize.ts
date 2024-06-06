import { TransactionContext } from "frog";
import { FiatTokenProxyAbi } from "../contracts/usdcAbi";
import { MAINNET_ARBITRUM_USDC_CONTRACT_ADDRESS } from "../contracts/addresses";
import type { BetInfoState } from "../types";
import { Address, isAddress } from "viem";
import { z } from "zod";

export const authorize = async (
  c: TransactionContext<{ State: BetInfoState }, "/tx/authorize/:spender">
) => {
  const { spender } = c.req.param();
  const AddressSchema = z.custom<Address>(isAddress, "Invalid Address");
  const { success, data: parsedSpender } = AddressSchema.safeParse(spender);
  if (!success) throw new Error();

  const { previousState } = c;
  const usdcAmount = BigInt(previousState.amount * 10 ** 6);
  return c.contract({
    abi: FiatTokenProxyAbi,
    to: MAINNET_ARBITRUM_USDC_CONTRACT_ADDRESS,
    chainId: "eip155:42161",
    functionName: "approve",
    args: [
      parsedSpender, // spender
      usdcAmount, // value
    ],
  });
};
