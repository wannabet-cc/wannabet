import { baseContracts, fetchEns } from "@/lib";
import { addressRegex, TCreateBetFormattedFormSchema, TCreateBetFormSchema } from "@/lib/types";
import { Address, parseUnits } from "viem";
import { normalize } from "viem/ens";

export async function formatFormData(
  address: Address,
  values: TCreateBetFormSchema,
): Promise<TCreateBetFormattedFormSchema> {
  const tokenAddress = baseContracts.getAddressFromName(values.tokenName);
  const bigintAmount = parseUnits(values.amount.toString(), baseContracts.getDecimalsFromName(values.tokenName));
  const validFor = BigInt(values.validForDays * 24 * 60 * 60);
  const [participantAddress, judgeAddress] = await Promise.all([
    addressRegex.test(values.participant)
      ? values.participant
      : (await fetchEns(normalize(values.participant.trim()) as `${string}.eth`)).address,
    addressRegex.test(values.judge)
      ? values.judge
      : (await fetchEns(normalize(values.judge.trim()) as `${string}.eth`)).address,
  ]);
  return {
    creator: address,
    participant: participantAddress,
    amount: bigintAmount,
    token: tokenAddress,
    message: values.message,
    judge: judgeAddress,
    validFor: validFor,
  } as TCreateBetFormattedFormSchema;
}
