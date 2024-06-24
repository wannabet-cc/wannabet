import { FiatTokenProxyAbi } from "../contracts/usdcAbi";
import { MAINNET_ARBITRUM_USDC_CONTRACT_ADDRESS } from "../contracts/addresses";
import { Address } from "viem";
import { type CustomTransactionContext } from "../types";
import { AddressSchema, BetAmountSchema } from "../zodSchemas";

export const authorizeTxn = async (
  c: CustomTransactionContext<"/tx/authorize">
) => {
  const spender = c.req.query("spender") as Address;
  const amount = Number(c.req.query("amount"));
  const { success: success1, data: parsedSpender } =
    AddressSchema.safeParse(spender);
  const { success: success2, data: parsedAmount } =
    BetAmountSchema.safeParse(amount);
  if (!success1 || !success2) throw new Error();

  const usdcAmount = BigInt(parsedAmount);

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
