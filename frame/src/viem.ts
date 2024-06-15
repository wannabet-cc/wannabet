import { createPublicClient, http } from "viem";
import { mainnet, arbitrum } from "viem/chains";
import { type CustomContext } from ".";

export const mainnetClientFn = (c: CustomContext) => {
  return createPublicClient({
    chain: mainnet,
    transport: http(c.env.MAINNET_ALCHEMY_URL),
  });
};
export const arbitrumClientFn = (c: CustomContext) => {
  return createPublicClient({
    chain: arbitrum,
    transport: http(c.env.ARBITRUM_ALCHEMY_URL),
  });
};
