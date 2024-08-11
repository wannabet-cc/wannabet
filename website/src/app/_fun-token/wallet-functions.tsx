"use client";

import { config } from "@/app/providers";
import { WhitelistedFunToken } from "@/abis/WhitelistedFunToken";
import { Address } from "viem";
import { readContract, writeContract } from "@wagmi/core";
import { baseContracts } from "@/lib";
import { base } from "viem/chains";

/**
 * This file includes functions that are intended to be used on the CLIENT. Using
 * these on the server will result in an error due to importing the wagmi config
 * from the providers file.
 */

/**
 * Read if a given address is whitelisted from fun token contract
 */
export async function readIfWhitelisted(address: Address) {
  return readContract(config, {
    address: baseContracts.getAddressFromName("JFF"),
    abi: WhitelistedFunToken,
    functionName: "hasRole",
    args: [WHITELISTED_ROLE, address!],
    chainId: base.id,
  });
}

const WHITELISTED_ROLE = "0x8429d542926e6695b59ac6fbdcd9b37e8b1aeb757afab06ab60b1bb5878c3b49";

/**
 * Read last mint time from fun token contract
 */
export async function readLastMintTime(address: Address) {
  return readContract(config, {
    abi: WhitelistedFunToken,
    address: baseContracts.getAddressFromName("JFF"),
    functionName: "lastMintTime",
    args: [address],
    chainId: base.id,
  });
}

/**
 * Write - "mint" from fun token contract
 */
export async function mint() {
  return writeContract(config, {
    abi: WhitelistedFunToken,
    address: baseContracts.getAddressFromName("JFF"),
    functionName: "mint",
    chainId: base.id,
  });
}
