import { config } from "@/app/providers";
import { useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { writeContract, waitForTransactionReceipt } from "@wagmi/core";

/**
 * useWriteContract wrapper that includes isConfirming and isConfirmed booleans
 * for block confirmation
 */
export const useWriteContractWithConfirmation = () => {
  const { data: hash, ...writeOptions } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });
  return {
    data: hash,
    ...writeOptions,
    isConfirming,
    isConfirmed,
  };
};

/**
 * Hook that executes two sequential write contract calls, the second only
 * after the first is confirmed on a block
 */
export function useSequentialWriteContracts() {
  const [status, setStatus] = useState<sequentialTxnsStatus>("idle");

  const executeTxns = async (writeVars1: any, writeVars2: any) => {
    try {
      setStatus("submitting-1");
      const hash1 = await writeContract(config, writeVars1);
      setStatus("confirming-1");
      await waitForTransactionReceipt(config, { hash: hash1 });
      setStatus("submitting-2");
      const hash2 = await writeContract(config, writeVars2);
      setStatus("confirming-2");
      await waitForTransactionReceipt(config, { hash: hash2 });
      setStatus("completed");
    } catch (error) {
      setStatus("error");
      console.error("Transaction failed:", error);
    }
  };

  const isPending =
    status === "submitting-1" ||
    status === "submitting-2" ||
    status === "confirming-1" ||
    status === "confirming-2";
  const isSuccess = status === "completed";

  return { executeTxns, status, isPending, isSuccess };
}

type sequentialTxnsStatus =
  | "idle"
  | "submitting-1"
  | "confirming-1"
  | "submitting-2"
  | "confirming-2"
  | "completed"
  | "error";
