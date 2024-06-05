import { createPublicClient, http } from "viem";
import { arbitrum, arbitrumSepolia } from "viem/chains";

const arbitrumClient = createPublicClient({
  chain: arbitrum,
  transport: http(),
});
const arbitrumSepoliaClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

export { arbitrumClient, arbitrumSepoliaClient };
