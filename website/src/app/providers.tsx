"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { base } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "WannaBet",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "",
  chains: [base],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_ALCHEMY_URL),
  },
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
