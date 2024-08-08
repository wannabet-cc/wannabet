"use client";

// Types
import type { Address } from "viem";
// Wagmi
import { readContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { config } from "@/app/providers";
// Constants
import { FiatTokenProxyAbi } from "@/abis/FiatTokenProxyAbi";

/**
 * This file includes functions that are intended to be used on the CLIENT. Using
 * these on the server will result in an error.
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
    args: [account!],
  });
  if (!balance) throw new Error("Failed to read users' token balance");
  return balance > tokenThreshold;
}
