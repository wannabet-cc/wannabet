import { Address } from "viem";
import { arbitrumClient } from "./viem";
import { betAbi } from "./contracts/betAbi";

function shortenHexAddress(address: Address) {
  return `${address.slice(0, 5)}...${address.slice(-3)}`;
}

async function getBetDetails(betContractAddress: Address) {
  const [
    betId,
    creator,
    participant,
    amount,
    token,
    message,
    arbitrator,
    validUntil,
  ] = await arbitrumClient.readContract({
    address: betContractAddress,
    abi: betAbi,
    functionName: "betDetails",
    args: [],
  });
  return {
    betId,
    creator,
    participant,
    amount,
    token,
    message,
    arbitrator,
    validUntil,
  };
}

async function getBetWinner(betContractAddress: Address) {
  const winner = await arbitrumClient.readContract({
    address: betContractAddress,
    abi: betAbi,
    functionName: "winner",
  });
  return winner;
}

export { shortenHexAddress, getBetDetails, getBetWinner };
