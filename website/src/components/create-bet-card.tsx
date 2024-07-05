"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { z } from "zod";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { BASE_BET_FACTORY_ADDRESS, BASE_USDC_ADDRESS } from "@/config";
import { BetFactoryAbi } from "@/abis/BetFactoryAbi";
import { Address, parseUnits } from "viem";
import { fetchEnsAddress, getAddressFromTokenName, pause } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useToast } from "./ui/use-toast";
import { FiatTokenProxyAbi } from "@/abis/FiatTokenProxyAbi";
import { useState } from "react";
import { config } from "@/app/providers";

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
  const [submitLoading, setSubmitLoading] = useState(false);
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

  const handleSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (
    values,
    e,
  ) => {
    e?.preventDefault();
    setSubmitLoading(true);
    try {
      // Transform data
      const tokenAddress = getAddressFromTokenName(values.token);
      const bigintAmount = parseUnits(values.amount.toString(), 6);
      const validFor = BigInt(values.validForDays * 24 * 60 * 60);
      const [participantAddress, judgeAddress] = await Promise.all([
        addressRegex.test(values.participant)
          ? values.participant
          : (await fetchEnsAddress(values.participant)).address,
        addressRegex.test(values.judge)
          ? values.judge
          : (await fetchEnsAddress(values.judge)).address,
      ]);
      // Write contract: approve
      const approveHash = await writeContract(config, {
        address: BASE_USDC_ADDRESS,
        abi: FiatTokenProxyAbi,
        functionName: "approve",
        args: [BASE_BET_FACTORY_ADDRESS, bigintAmount],
      });
      // Wait for confirmation
      const { status: approveStatus } = await waitForTransactionReceipt(
        config,
        {
          hash: approveHash,
        },
      );
      // If success...
      if (approveStatus === "success") {
        // Write contract: create bet
        const betHash = await writeContract(config, {
          address: BASE_BET_FACTORY_ADDRESS,
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
        });
        // Wait for confirmation
        const { status: betStatus } = await waitForTransactionReceipt(config, {
          hash: betHash,
        });
        if (betStatus === "success")
          toast({
            title: "Bet created successfully!",
            description: "Txn hash: " + betHash,
          });
        else
          toast({
            title: "Bet creation failed to confirm",
            description: "Txn hash: " + betHash,
          });
      } else {
        toast({
          title: "Failed to authorize bet fund transfer",
          description: "Txn hash: " + approveHash,
        });
      }
      setSubmitLoading(false);
    } catch (error) {
      console.error(error);
      setSubmitLoading(false);
      toast({ title: "Submit error" });
    }
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
                <FormLabel>Who are you betting?</FormLabel>
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
                <FormLabel>What is your prediction</FormLabel>
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
                <FormLabel>Who will determine the winner?</FormLabel>
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
          <Button className="w-fit" type="submit" disabled={submitLoading}>
            {submitLoading ? "Confirming..." : "Submit"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
