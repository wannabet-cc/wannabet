"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
  type BaseError,
} from "wagmi";
import { BET_FACTORY_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "@/config";
import { BetFactoryAbi } from "@/abis/BetFactoryAbi";
import { Address, parseUnits } from "viem";
import { fetchEnsAddress, getAddressFromTokenName } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useToast } from "./ui/use-toast";
import { FiatTokenProxyAbi } from "@/abis/FiatTokenProxyAbi";
import { useState } from "react";

export function CreateBetCard() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Start a new bet</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <CreateBetForm />
      </CardContent>
    </Card>
  );
}

const addressRegex = /^0x[a-fA-F0-9]{40}$/;
const ensRegex = /^.{3,}\.eth$/; // /^[a-z0-9]+\.eth$/;
const ensOrAddressSchema = z
  .string()
  .refine((value) => ensRegex.test(value) || addressRegex.test(value), {
    message: "Invalid ENS name or ethereum address",
  });

const formSchema = z.object({
  participant: ensOrAddressSchema,
  amount: z.coerce.number().positive(),
  token: z.literal("USDC"),
  message: z.string(),
  validForDays: z.coerce.number().positive().lte(14),
  judge: ensOrAddressSchema,
});

function CreateBetForm() {
  const account = useAccount();
  const [submitLoading, setSubmitLoading] = useState(false); // temporary
  const {
    data: hash,
    writeContractAsync,
    isPending,
    error,
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({ hash });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      participant: "",
      amount: 1,
      token: "USDC",
      message: "",
      validForDays: 7,
      judge: "",
    },
  });
  const { toast } = useToast();

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setSubmitLoading(true); // temporary
    // token: get contract address from string name
    const tokenAddress = getAddressFromTokenName(values.token);
    // amount: add decimals and convert to bigint
    const bigintAmount = parseUnits(values.amount.toString(), 6);
    // validFor: change days to seconds and convert to bigint
    const validFor = BigInt(values.validForDays * 24 * 60 * 60);
    // ens names
    const [participantAddress, judgeAddress] = await Promise.all([
      addressRegex.test(values.participant)
        ? values.participant
        : (await fetchEnsAddress(values.participant)).address,
      addressRegex.test(values.judge)
        ? values.judge
        : (await fetchEnsAddress(values.judge)).address,
    ]);
    // write contract: approve bet factory
    await writeContractAsync({
      address: USDC_CONTRACT_ADDRESS,
      abi: FiatTokenProxyAbi,
      functionName: "approve",
      args: [BET_FACTORY_CONTRACT_ADDRESS, bigintAmount],
    });
    // write contract: create bet
    await writeContractAsync(
      {
        address: BET_FACTORY_CONTRACT_ADDRESS,
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
        value: parseUnits("0.0002", 18),
      },
      {
        onSuccess: () => {
          toast({ title: "Bet created successfully!", description: hash });
        },
      },
    );
    setSubmitLoading(false); // temporary
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
        {/* bet participant: ens name or address */}
        <FormField
          control={form.control}
          name="participant"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Participant</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="abc.eth or 0xabc..."
                    type="text"
                  />
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
          name="token"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Token</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-2"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="USDC" />
                      </FormControl>
                      <FormLabel className="font-normal">USDC</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
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
                  <Input
                    {...field}
                    placeholder="abc.eth or 0xabc..."
                    type="text"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        {/* submit */}
        <div className="flex flex-col space-y-2 pt-4">
          {/* <Button className="w-fit" onClick={handleAuthorize}>Authorize</Button> */}
          <Button
            className="w-fit"
            type="submit"
            disabled={account.isDisconnected || isPending || submitLoading} // submitLoading is temporary
          >
            {isPending || submitLoading ? "Confirming..." : "Submit"}
          </Button>
        </div>
      </form>
      {/* status info */}
      {hash && (
        <pre className="text-wrap text-sm">Transaction hash: {hash}</pre>
      )}
      {isConfirming && (
        <pre className="text-wrap text-sm">Waiting for confirmation...</pre>
      )}
      {isConfirmed && (
        <pre className="text-wrap text-sm">Transaction confirmed.</pre>
      )}
      {error && (
        <pre className="text-wrap text-sm">
          Error: {(error as BaseError).shortMessage || error.message}
        </pre>
      )}
    </Form>
  );
}
