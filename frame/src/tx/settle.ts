import { Env, TransactionContext } from "frog";
import { Address, isAddress } from "viem";
import { z } from "zod";
import { betAbi } from "../contracts/betAbi";

export const settleTxn = async (c: TransactionContext<Env, "/tx/settle">) => {
  const contractAddress = c.req.query("contract") as Address;
  const winnerAddress = c.req.query("winner") as Address;
  const AddressSchema = z.custom<Address>(isAddress, "Invalid Address");
  const { success: contractSuccess, data: parsedContractAddress } =
    AddressSchema.safeParse(contractAddress);
  const { success: winnerSuccess, data: parsedWinnerAddress } =
    AddressSchema.safeParse(winnerAddress);
  if (!contractSuccess || !winnerSuccess) throw new Error();

  return c.contract({
    abi: betAbi,
    to: parsedContractAddress,
    chainId: "eip155:42161",
    functionName: "settleBet",
    args: [parsedWinnerAddress],
  });
};
