import { createPublicClient, http } from "viem";
import { mainnet, arbitrum } from "viem/chains";
import { type CustomEnvVars } from "./types";

export const mainnetClientFn = (env: CustomEnvVars) => {
  return createPublicClient({
    chain: mainnet,
    transport: http(env.MAINNET_ALCHEMY_URL),
  });
};
export const arbitrumClientFn = (env: CustomEnvVars) => {
  return createPublicClient({
    chain: arbitrum,
    transport: http(env.ARBITRUM_ALCHEMY_URL),
  });
};
