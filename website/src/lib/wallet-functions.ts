"use client";

// Types
import type { Address } from "viem";
import type { WriteContractReturnType } from "@wagmi/core";
import type { TCreateBetFormattedFormSchema } from "./types";
// Wagmi
import { readContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { config } from "@/app/providers";
// Contract Imports
import { FiatTokenProxyAbi } from "@/abis/FiatTokenProxyAbi";
import { BetFactoryAbi } from "@/abis/BetFactoryAbi";
import { BetAbi } from "@/abis/BetAbi";
import { baseContracts } from "./contracts";
import { base } from "viem/chains";

/**
 * This file includes functions that are intended to be used on the CLIENT. Using
 * these on the server will result in an error due to importing the wagmi config
 * from the providers file.
 */

/**
 * Returns boolean for if a given address has more or equal tokens to a given threshold.
 * Function will throw if the data fetch fails.
 */
export async function hasEnoughTokens(account: Address, token: Address, tokenThreshold: bigint): Promise<boolean> {
  const balance = await readContract(config, {
    address: token,
    abi: FiatTokenProxyAbi,
    functionName: "balanceOf",
    args: [account],
    chainId: base.id,
  });
  if (!balance) throw new Error("Failed to read users' token balance");
  return balance >= tokenThreshold;
}

/**
 * Prompt user to approve token transfer to a given contract if tokens
 * aren't already approved.
 */
export async function ensureTokenApproval(
  address: Address,
  spender: Address,
  token: Address,
  tokenAmount: bigint,
): Promise<void> {
  const preexistingApprovedAmount = await readContract(config, {
    address: token,
    abi: FiatTokenProxyAbi,
    functionName: "allowance",
    args: [address, spender],
    chainId: base.id,
  });
  if (preexistingApprovedAmount < tokenAmount) {
    const approveHash = await writeContract(config, {
      address: token,
      abi: FiatTokenProxyAbi,
      functionName: "approve",
      args: [spender, tokenAmount],
      chainId: base.id,
    });
    const { status: approveStatus } = await waitForTransactionReceipt(config, {
      hash: approveHash,
    });
    if (approveStatus === "reverted") throw new Error("Token approval reverted");
  }
}

/**
 * Prompts the user to create a bet given a set of formatted bet values
 */
export async function createBet(values: TCreateBetFormattedFormSchema): Promise<WriteContractReturnType> {
  const hash = await writeContract(config, {
    address: baseContracts.getAddressFromName("BetFactory")!,
    abi: BetFactoryAbi,
    functionName: "createBet",
    args: [values.participant, values.amount, values.token, values.message, values.judge, values.validFor],
    chainId: base.id,
  });
  const { status } = await waitForTransactionReceipt(config, { hash });
  if (status === "reverted") throw new Error("Bet transaction reverted");
  return hash;
}

/**
 * Retrieves tokens from a bet contract if the bet is expired (i.e. executes "retrieveTokens"
 * on a specified bet contract
 */
export async function retrieveTokens(betContract: Address): Promise<WriteContractReturnType> {
  return writeContract(config, {
    address: betContract,
    abi: BetAbi,
    functionName: "retrieveTokens",
    chainId: base.id,
  });
}

/**
 * Accepts a given bet contract (i.e. approves a transfer of tokens of the given bet amount
 * then executes "acceptBet")
 */
export async function acceptBet(
  address: Address,
  betContract: Address,
  token: Address,
  tokenAmount: bigint,
): Promise<WriteContractReturnType> {
  await ensureTokenApproval(address, betContract, token, tokenAmount);
  return writeContract(config, {
    address: betContract,
    abi: BetAbi,
    functionName: "acceptBet",
    chainId: base.id,
  });
}

/**
 * Declines a given bet contract (i.e. executes "declineBet")
 */
export async function declineBet(betContract: Address): Promise<WriteContractReturnType> {
  return writeContract(config, {
    address: betContract,
    abi: BetAbi,
    functionName: "declineBet",
    chainId: base.id,
  });
}

/**
 * Selects the winner of a bet (i.e. executes "settleBet" on a specified
 * bet contract for a specific account)
 */
export async function settleBet(betContract: Address, winner: Address): Promise<WriteContractReturnType> {
  return writeContract(config, {
    address: betContract,
    abi: BetAbi,
    functionName: "settleBet",
    args: [winner, ""],
    chainId: base.id,
  });
}
