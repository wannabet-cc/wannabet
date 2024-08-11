"use client";

// Constants
import { FiatTokenProxyAbi } from "@/abis/FiatTokenProxyAbi";
// Hooks
import { useAccount, useReadContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useFetchEns } from "@/hooks";
import { useEffect } from "react";
// Utility Functions
import { abbreviateHex, roundFloat } from "@/utils";
import { formatUnits } from "viem";
import { baseContracts } from "@/lib";
// Form Imports & Components
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBetFormSchema, type TCreateBetFormSchema } from "@/lib/types";
import { onSubmitAction } from "./form-submit";
// Components
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const NAME_RESOLVING_ERROR_MSG = "Error finding user. Try another name.";

export function CreateBetForm() {
  const { address } = useAccount();
  const queryClient = useQueryClient();
  const router = useRouter();
  const form = useForm<TCreateBetFormSchema>({
    resolver: zodResolver(createBetFormSchema),
    defaultValues: {
      participant: "",
      amount: 1,
      tokenName: "USDC",
      message: "",
      validForDays: 7,
      judge: "",
    },
    mode: "onTouched",
    reValidateMode: "onBlur",
  });

  // Token Balance State
  const tokenName = form.watch("tokenName");
  const { data: tokenBalance } = useReadContract({
    address: baseContracts.getAddressFromName(tokenName),
    abi: FiatTokenProxyAbi,
    functionName: "balanceOf",
    args: [address ? address : "0x"],
    query: { enabled: !!address },
  });

  // Participant Address State
  const participant = form.watch("participant");
  const participantIsReady =
    !!participant &&
    form.getFieldState("participant", form.formState).isTouched &&
    !form.getFieldState("participant", form.formState).invalid;
  const { data: participantEnsRes } = useFetchEns(participant as any, participantIsReady);
  useEffect(() => {
    if (!participantEnsRes) return;
    form.setValue("participantAddress", participantEnsRes.address);
  }, [participantEnsRes]);

  // Judge Address State
  const judge = form.watch("judge");
  const judgeIsReady =
    !!judge &&
    form.getFieldState("judge", form.formState).isTouched &&
    !form.getFieldState("judge", form.formState).invalid;
  const { data: judgeEnsRes } = useFetchEns(judge as any, judgeIsReady);
  useEffect(() => {
    if (!judgeEnsRes) return;
    form.setValue("judgeAddress", judgeEnsRes.address);
  }, [judgeEnsRes]);

  // Handle Submit
  async function onSubmit(data: TCreateBetFormSchema) {
    console.log("submitting");
    if (!address) return;

    const resData = await onSubmitAction(address, data);
    console.log(resData);
    if (resData?.issues) return;

    await queryClient.invalidateQueries({ queryKey: ["recentBetData"] });
    await queryClient.invalidateQueries({ queryKey: ["myBetData"] });
    form.reset();
    router.push("/");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, console.log)} className="space-y-2">
        {/* bet participant: ens name or address */}
        <FormField
          control={form.control}
          name="participant"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Participant</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="abc.eth or 0xabc..." type="text" />
                </FormControl>
                {participantIsReady && (
                  <>
                    {participantEnsRes && participantEnsRes.address && (
                      <FormDescription>Resolves to: {abbreviateHex(participantEnsRes.address, 4)}</FormDescription>
                    )}
                    {participantEnsRes && participantEnsRes.address === null && (
                      <FormDescription>{NAME_RESOLVING_ERROR_MSG}</FormDescription>
                    )}
                  </>
                )}
                <FormMessage />
              </FormItem>
            );
          }}
        />
        {/* bet amount: number */}
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="1" type="number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        {/* bet token: select an address */}
        <FormField
          control={form.control}
          name="tokenName"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Token</FormLabel>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-2">
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="USDC" />
                      </FormControl>
                      <FormLabel className="font-normal">USDC</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="WETH" />
                      </FormControl>
                      <FormLabel className="font-normal">WETH</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="rETH" />
                      </FormControl>
                      <FormLabel className="font-normal">rETH</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="JFF" />
                      </FormControl>
                      <FormLabel className="font-normal">JFF</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>

                <FormMessage />
              </FormItem>
            );
          }}
        />
        {address && (
          <FormDescription>
            {"Your balance: "}
            {tokenBalance ? (
              <span>
                {roundFloat(
                  Number(formatUnits(tokenBalance, baseContracts.getDecimalsFromName(form.getValues("tokenName")))),
                  5,
                )}
              </span>
            ) : (
              "..."
            )}
          </FormDescription>
        )}
        {/* message: string */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="" type="text" />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        {/* valid for days: number */}
        <FormField
          control={form.control}
          name="validForDays"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Number of days opponent has to accept</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="" type="number" />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        {/* bet judge: address */}
        <FormField
          control={form.control}
          name="judge"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Judge</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="abc.eth or 0xabc..." type="text" />
                </FormControl>
                {judgeIsReady && (
                  <>
                    {judgeEnsRes && judgeEnsRes.address && (
                      <FormDescription>Resolves to: {abbreviateHex(judgeEnsRes.address, 4)}</FormDescription>
                    )}
                    {judgeEnsRes && judgeEnsRes.address === null && (
                      <FormDescription>{NAME_RESOLVING_ERROR_MSG}</FormDescription>
                    )}
                  </>
                )}
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <div className="w-full pt-6 *:w-full">
          <Button type="submit" disabled={!address || form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
