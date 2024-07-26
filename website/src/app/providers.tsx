"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { TooltipProvider } from "@/components/ui/tooltip";

export const defaultConfig = createConfig({
  chains: [base, mainnet],
  ssr: true,
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_ALCHEMY_URL),
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_ALCHEMY_URL),
  },
});

export const mainnetConfig = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(process.env.NEXT_PUBLIC_MAINNET_ALCHEMY_URL),
  },
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId="clyyp3crh0ar0yht8gj1gzj8t"
      config={{
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          // logo: "https://your-logo-url",
        },
        loginMethods: ["wallet", "email", "sms"],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={defaultConfig}>
          <TooltipProvider>{children}</TooltipProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
