import { TransactionContext } from "frog";
import { FiatTokenProxyAbi } from "../contracts/usdcAbi";
import { MAINNET_ARBITRUM_USDC_CONTRACT_ADDRESS } from "../contracts/addresses";
import type { BetInfoState } from "../types";
import { Address, isAddress } from "viem";
import { z } from "zod";

export const authorizeTxn = async (
  c: TransactionContext<{ State: BetInfoState }, "/tx/authorize">
) => {
  const spender = c.req.query("spender") as Address;
  const amount = c.req.query("amount");
  const AddressSchema = z.custom<Address>(isAddress, "Invalid Address");
  const AmountSchema = z.number().positive();
  const { success: success1, data: parsedSpender } =
    AddressSchema.safeParse(spender);
  const { success: success2, data: parsedAmount } =
    AmountSchema.safeParse(amount);
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
