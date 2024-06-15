import { createPublicClient, http } from "viem";
import { mainnet, arbitrum } from "viem/chains";
import { FrogEnv } from ".";
import { FrameContext } from "frog";

export const mainnetClientFn = (c: FrameContext<FrogEnv>) => {
  return createPublicClient({
    chain: mainnet,
    transport: http(c.env.MAINNET_ALCHEMY_URL),
  });
};
export const arbitrumClientFn = (c: FrameContext<FrogEnv>) => {
  return createPublicClient({
    chain: arbitrum,
    transport: http(c.env.ARBITRUM_ALCHEMY_URL),
  });
};
