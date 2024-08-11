// Constants & Contract Imports
import { baseContracts } from "@/lib";
// Utility Functions
import { createBet, ensureTokenApproval, hasEnoughTokens } from "@/lib/wallet-functions";
// Form Imports & Components
import { createBetFormattedFormSchema, createBetFormSchema, type TCreateBetFormSchema } from "@/lib/types";
import { Address } from "viem";
import { formatFormData } from "./form-utils";

export type FormState = {
  message?: string;
  fields?: Record<string, string>;
  issues?: string[];
};

export const onSubmitAction = async function (
  address: Address,
  data: TCreateBetFormSchema,
): Promise<FormState | undefined> {
  try {
    const parsed = createBetFormSchema.safeParse(data);

    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const key of Object.keys(data) as Array<keyof typeof data>) {
        fields[key] = data[key].toString();
      }
      return {
        message: "Invalid form data",
        fields,
        issues: parsed.error.issues.map((issue) => issue.message),
      };
    }

    const formatted = await formatFormData(address, data);
    const formattedParsed = createBetFormattedFormSchema.safeParse(formatted);

    if (!formattedParsed.success) {
      const fields: Record<string, string> = {};
      for (const key of Object.keys(formatted) as Array<keyof typeof formatted>) {
        fields[key as string] = formatted[key].toString();
      }
      return {
        message: "Invalid form data",
        fields,
        issues: formattedParsed.error.issues.map((issue) => issue.message),
      };
    }

    console.table(formattedParsed.data);

    const hasEnough = await hasEnoughTokens(
      formattedParsed.data.creator,
      formattedParsed.data.token,
      formattedParsed.data.amount,
    );
    if (!hasEnough) return { message: "Invalid form data", issues: ["User doesn't have enough tokens"] };
    await ensureTokenApproval(
      formattedParsed.data.creator,
      baseContracts.getAddressFromName("BetFactory"),
      formattedParsed.data.token,
      formattedParsed.data.amount,
    );

    await createBet(formattedParsed.data);

    return { message: "Bet created" };
  } catch (error) {
    return { message: "Failed to create bet", issues: ["Failed to query rpc provider"] };
  }
};
