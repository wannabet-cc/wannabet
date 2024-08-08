"use client";

// Types
import type { Address } from "viem";
// Wagmi
import { readContract, waitForTransactionReceipt, writeContract } from "@wagmi/core";
import { config } from "@/app/providers";
// Contract Imports
import { FiatTokenProxyAbi } from "@/abis/FiatTokenProxyAbi";
import { baseContracts } from "./contracts";

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
  });
  if (!balance) throw new Error("Failed to read users' token balance");
  return balance >= tokenThreshold;
}

/**
 * Prompt user to approve token transfer to the "BetFactory" contract if tokens
 * aren't already approved.
 */
export async function ensureTokenApproval(account: Address, token: Address, tokenAmount: bigint): Promise<void> {
  const preexistingApprovedAmount = await readContract(config, {
    address: token,
    abi: FiatTokenProxyAbi,
    functionName: "allowance",
    args: [account, baseContracts.getAddressFromName("BetFactory")],
  });
  if (preexistingApprovedAmount < tokenAmount) {
    const approveHash = await writeContract(config, {
      address: token,
      abi: FiatTokenProxyAbi,
      functionName: "approve",
      args: [baseContracts.getAddressFromName("BetFactory"), tokenAmount],
    });
    const { status: approveStatus } = await waitForTransactionReceipt(config, {
      hash: approveHash,
    });
    if (approveStatus === "reverted") throw new Error("Token approval reverted");
  }
}
