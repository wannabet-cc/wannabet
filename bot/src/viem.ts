import { createPublicClient, http } from "viem";
import { arbitrum } from "viem/chains";
import { ARBITRUM_ALCHEMY_URL } from "./config";

const arbitrumClient = createPublicClient({
  chain: arbitrum,
  transport: http(ARBITRUM_ALCHEMY_URL),
});

export { arbitrumClient };
