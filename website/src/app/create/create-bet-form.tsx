"use client";

import { BetFactoryAbi } from "@/abis/BetFactoryAbi";
import { FiatTokenProxyAbi } from "@/abis/FiatTokenProxyAbi";
import { config } from "@/app/providers";
import { fetchEns, baseContracts } from "@/lib";
import { roundFloat } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Address, formatUnits, parseUnits } from "viem";
import { normalize } from "viem/ens";
import { useAccount, useReadContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LoadingSpinner } from "@/components/ui/spinner";
import { addressRegex, createBetFormSchema, type TCreateBetFormSchema } from "@/lib/types";
import { ensureTokenApproval, hasEnoughTokens } from "@/lib/wallet-functions";

export function CreateBetForm() {
  const { address } = useAccount();

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
  });

  const { reset, getValues, formState } = form;
  const { isValid, isSubmitting } = formState;

  const { data: tokenBalance } = useReadContract({
    address: baseContracts.getAddressFromName(getValues("tokenName")),
    abi: FiatTokenProxyAbi,
    functionName: "balanceOf",
    args: [address ? address : "0x"],
    query: { enabled: !!address },
  });

  form.watch("tokenName");

  const decimals = baseContracts.getDecimalsFromName(getValues("tokenName"));

  const onSubmit: SubmitHandler<TCreateBetFormSchema> = async (values) => {
    try {
      if (!address) throw new Error("No user account detected");

      /** Transform form data */
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

      /** Throw if user doesn't have enough tokens */
      const hasEnough = await hasEnoughTokens(address, tokenAddress, bigintAmount);
      if (!hasEnough) throw new Error("User doesn't have enough tokens");

      /** Approve token transfer IF tokens aren't already approved */
      await ensureTokenApproval(address, tokenAddress, bigintAmount);

      /** Create bet */
      const betHash = await writeContract(config, {
        address: baseContracts.getAddressFromName("BetFactory")!,
        abi: BetFactoryAbi,
        functionName: "createBet",
        args: [
          participantAddress as Address,
          bigintAmount,
          tokenAddress as Address,
          values.message,
          judgeAddress as Address,
          validFor,
        ],
      });
      const { status: betStatus } = await waitForTransactionReceipt(config, {
        hash: betHash,
      });
      if (betStatus === "reverted") throw new Error("Bet transaction reverted");
      reset();
    } catch (error) {
      throw new Error("Failed to create bet: " + error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
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
          <div className="text-sm text-muted-foreground">
            {"Your balance: "}
            {tokenBalance ? <span>{roundFloat(Number(formatUnits(tokenBalance, decimals)), 5)}</span> : "..."}
          </div>
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
                <FormMessage />
              </FormItem>
            );
          }}
        />
        {/* submit */}
        <div className="flex flex-col space-y-2 pt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button type="submit" disabled={!isValid || !address || isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Creating new bet</DialogTitle>
              </DialogHeader>
              <LoadingSpinner />
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </Form>
  );
}
