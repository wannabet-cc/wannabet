import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_MAINNET_ALCHEMY_URL: z.string(),
    NEXT_PUBLIC_BASE_ALCHEMY_URL: z.string(),
    NEXT_PUBLIC_ARB_ALCHEMY_URL: z.string(),
    NEXT_PUBLIC_NEYNAR_API_KEY: z.string(),
    NEXT_PUBLIC_PRIVY_APP_ID_DEV: z.string().optional(),
    NEXT_PUBLIC_PRIVY_APP_ID_PROD: z.string(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_MAINNET_ALCHEMY_URL: process.env.NEXT_PUBLIC_MAINNET_ALCHEMY_URL,
    NEXT_PUBLIC_BASE_ALCHEMY_URL: process.env.NEXT_PUBLIC_BASE_ALCHEMY_URL,
    NEXT_PUBLIC_ARB_ALCHEMY_URL: process.env.NEXT_PUBLIC_ARB_ALCHEMY_URL,
    NEXT_PUBLIC_NEYNAR_API_KEY: process.env.NEXT_PUBLIC_NEYNAR_API_KEY,
    NEXT_PUBLIC_PRIVY_APP_ID_DEV: process.env.NEXT_PUBLIC_PRIVY_APP_ID_DEV,
    NEXT_PUBLIC_PRIVY_APP_ID_PROD: process.env.NEXT_PUBLIC_PRIVY_APP_ID_PROD,
  },
});
