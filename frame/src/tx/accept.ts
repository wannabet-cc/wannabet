import { Address, isAddress } from "viem";
import { z } from "zod";
import { betAbi } from "../contracts/betAbi";
import { type CustomTransactionContext } from "..";

export const acceptTxn = async (c: CustomTransactionContext<"/tx/accept">) => {
  const contractAddress = c.req.query("contract") as Address;
  const AddressSchema = z.custom<Address>(isAddress, "Invalid Address");
  const { success, data: parsedAddress } =
    AddressSchema.safeParse(contractAddress);
  if (!success) throw new Error();

  return c.contract({
    abi: betAbi,
    to: parsedAddress,
    chainId: "eip155:42161",
    functionName: "acceptBet",
  });
};
