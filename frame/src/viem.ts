import { createPublicClient, http } from "viem";
import { mainnet, arbitrum, arbitrumSepolia } from "viem/chains";

const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});
const arbitrumClient = createPublicClient({
  chain: arbitrum,
  transport: http(),
});
const arbitrumSepoliaClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

export { mainnetClient, arbitrumClient, arbitrumSepoliaClient };
