"use client";

import { BetFactoryAbi } from "@/abis/BetFactoryAbi";
import { FiatTokenProxyAbi } from "@/abis/FiatTokenProxyAbi";
import { config } from "@/app/providers";
import { fetchEns, baseContracts } from "@/lib";
import { roundFloat } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { readContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { Address, formatUnits, parseUnits } from "viem";
import { normalize } from "viem/ens";
import { useAccount, useReadContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/spinner";

const addressRegex = /^0x[a-fA-F0-9]{40}$/;
const ensRegex = /^.{3,}\.eth$/; // /^[a-z0-9]+\.eth$/;
const ensOrAddressSchema = z.string().refine((value) => ensRegex.test(value) || addressRegex.test(value), {
  message: "Invalid ENS name or ethereum address",
});

const formSchema = z.object({
  participant: ensOrAddressSchema,
  amount: z.coerce.number().positive(),
  tokenName: z.string().refine((name) => name === "USDC" || name === "WETH" || name === "rETH" || name === "JFF"),
  message: z.string(),
  validForDays: z.coerce.number().positive().lte(14),
  judge: ensOrAddressSchema,
});

export function CreateBetForm() {
  const { address } = useAccount();
  const [createStatus, setCreateStatus] = useState<createStatus>("idle");
  const [error, setError] = useState<Error>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      participant: "",
      amount: 1,
      tokenName: "USDC",
      message: "",
      validForDays: 7,
      judge: "",
    },
  });
  const { toast } = useToast();
  const { data: tokenBalance } = useReadContract({
    address: baseContracts.getAddressFromName(form.getValues("tokenName")),
    abi: FiatTokenProxyAbi,
    functionName: "balanceOf",
    args: [address ? address : "0x"],
    query: {
      enabled: !!address,
    },
  });

  form.watch("tokenName");

  const decimals = baseContracts.getDecimalsFromName(form.getValues("tokenName"));

  const handleSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (values, e) => {
    e?.preventDefault();
    setCreateStatus("1-transforming-data");
    try {
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
      setCreateStatus("2-checking-balance");
      const balance = await readContract(config, {
        address: tokenAddress,
        abi: FiatTokenProxyAbi,
        functionName: "balanceOf",
        args: [address!],
      });
      if (balance < bigintAmount) {
        toast({
          title: "Insufficient balance",
          description: "You don't have enough tokens to create this bet",
        });
        setCreateStatus("error");
        return;
      }

      /** Approve token transfer IF tokens aren't already approved */
      setCreateStatus("3-checking-approval");
      const preexistingApprovedAmount = await readContract(config, {
        address: tokenAddress,
        abi: FiatTokenProxyAbi,
        functionName: "allowance",
        args: [address!, baseContracts.getAddressFromName("BetFactory")!],
      });
      if (preexistingApprovedAmount < bigintAmount) {
        setCreateStatus("4-approving");
        const approveHash = await writeContract(config, {
          address: tokenAddress,
          abi: FiatTokenProxyAbi,
          functionName: "approve",
          args: [baseContracts.getAddressFromName("BetFactory")!, bigintAmount],
        });
        setCreateStatus("5-confirming-approval");
        const { status: approveStatus } = await waitForTransactionReceipt(config, {
          hash: approveHash,
        });
        if (approveStatus !== "success") {
          toast({
            title: "Failed to authorize bet fund transfer",
            description: "Txn hash: " + approveHash,
          });
          setCreateStatus("error");
          return;
        }
      }

      /** Create bet */
      setCreateStatus("6-creating-bet");
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
      setCreateStatus("7-confirming-creation");
      const { status: betStatus } = await waitForTransactionReceipt(config, {
        hash: betHash,
      });
      if (betStatus === "success") {
        toast({
          title: "Bet created successfully!",
          description: "Txn hash: " + betHash,
        });
        setCreateStatus("success");
      } else {
        toast({
          title: "Bet creation failed to confirm",
          description: "Txn hash: " + betHash,
        });
        setCreateStatus("error");
      }
    } catch (error) {
      console.error(error);
      setCreateStatus("error");
      setError(error as Error);
    }
  };

  const isLoading = !(createStatus === "idle" || createStatus === "error" || createStatus === "success");

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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Confirming..." : "Submit"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Creating new bet</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 overflow-hidden">
                <div className="flex items-center space-x-4">
                  {isLoading && <LoadingSpinner />}
                  <span>{getStatusMessage(createStatus)}</span>
                </div>
                {error && (
                  <pre className="overflow-x-auto rounded bg-muted p-2 text-sm text-muted-foreground">
                    <div>{error.name}</div>
                    <div>{error.message}</div>
                  </pre>
                )}
              </div>
              {!isLoading && (
                <DialogFooter className="sm:justify-start">
                  <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={() => setError(undefined)}>
                      Close
                    </Button>
                  </DialogClose>
                </DialogFooter>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </Form>
  );
}

type createStatus =
  | "idle"
  | "1-transforming-data"
  | "2-checking-balance"
  | "3-checking-approval"
  | "4-approving"
  | "5-confirming-approval"
  | "6-creating-bet"
  | "7-confirming-creation"
  | "success"
  | "error";

const getStatusMessage = (status: createStatus): string => {
  if (status === "1-transforming-data") return "Transforming form data";
  else if (status === "2-checking-balance") return "Checking your token balance";
  else if (status === "3-checking-approval") return "Checking your approval";
  else if (status === "4-approving") return "Approving token transfer";
  else if (status === "5-confirming-approval") return "Confirming token transfer approval";
  else if (status === "6-creating-bet") return "Signing create bet transaction";
  else if (status === "7-confirming-creation") return "Confirming bet creation";
  else if (status === "success") return "Success!";
  else if (status === "error") return "Error:";
  else return "";
};
