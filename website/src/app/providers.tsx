"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { createConfig, WagmiProvider } from "@privy-io/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BASE_ALCHEMY_URL, MAINNET_ALCHEMY_URL, PRIVY_APP_ID } from "@/config/client";

export const config = createConfig({
  chains: [base, mainnet],
  ssr: true,
  transports: {
    [base.id]: http(BASE_ALCHEMY_URL),
    [mainnet.id]: http(MAINNET_ALCHEMY_URL),
  },
});

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          // logo: "https://your-logo-url",
        },
        loginMethods: ["wallet", "email"],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <TooltipProvider>{children}</TooltipProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
