import { Address } from "viem";
import { betAbi } from "../contracts/betAbi";
import { type CustomTransactionContext } from "../types";
import { AddressSchema } from "../zodSchemas";

export const settleTxn = async (c: CustomTransactionContext<"/tx/settle">) => {
  const contractAddress = c.req.query("contract") as Address;
  const winnerAddress = c.req.query("winner") as Address;
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
