"use client";

import { config, queryClient } from "@/app/providers";
import { WhitelistedFunToken } from "@/abis/WhitelistedFunToken";
import { Address } from "viem";
import { readContract, writeContract } from "@wagmi/core";
import { baseContracts } from "@/lib";
import { pause } from "@/utils";

/**
 * This file includes functions that are intended to be used on the CLIENT. Using
 * these on the server will result in an error due to importing the wagmi config
 * from the providers file.
 */

/**
 * Check if a given address is whitelisted
 */
export async function checkIfWhitelisted(address: Address) {
  return readContract(config, {
    address: baseContracts.getAddressFromName("JFF"),
    abi: WhitelistedFunToken,
    functionName: "hasRole",
    args: [WHITELISTED_ROLE, address!],
  });
}

const WHITELISTED_ROLE = "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49";

/**
 * Get last mint time
 */
export async function getLastMintTime(address: Address) {
  return readContract(config, {
    abi: WhitelistedFunToken,
    address: baseContracts.getAddressFromName("JFF"),
    functionName: "lastMintTime",
    args: [address],
  });
}

export async function handleClaim(queryKeys: any[][]) {
  const hash = await writeContract(config, {
    abi: WhitelistedFunToken,
    address: baseContracts.getAddressFromName("JFF"),
    functionName: "mint",
  });
  // Invalidate caches
  queryKeys.forEach((queryKey) => {
    queryClient.invalidateQueries({ queryKey });
  });
  return hash;
}
