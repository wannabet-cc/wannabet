"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { base } from "wagmi/chains";
import { BASE_ALCHEMY_URL } from "@/config";

const config = getDefaultConfig({
  appName: "WannaBet",
  projectId: "YOUR_PROJECT_ID",
  chains: [base],
  transports: {
    [base.id]: http(BASE_ALCHEMY_URL),
  },
  ssr: true, // If your dApp uses server side rendering (SSR)
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={base}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
