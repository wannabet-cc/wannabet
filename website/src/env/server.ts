import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    MAINNET_ALCHEMY_URL: z.string().url(),
    BASE_ALCHEMY_URL: z.string().url(),
    ARB_ALCHEMY_URL: z.string().url(),
    BET_API_URL: z.string().url(),
    NEYNAR_API_KEY: z.string(),
    NAMESTONE_API_KEY: z.string(),
    PRIVY_APP_ID_DEV: z.string().optional(),
    PRIVY_APP_ID_PROD: z.string(),
    PRIVY_APP_SECRET_DEV: z.string().optional(),
    PRIVY_APP_SECRET_PROD: z.string(),
  },
  runtimeEnv: {
    MAINNET_ALCHEMY_URL: process.env.MAINNET_ALCHEMY_URL,
    BASE_ALCHEMY_URL: process.env.BASE_ALCHEMY_URL,
    ARB_ALCHEMY_URL: process.env.ARB_ALCHEMY_URL,
    BET_API_URL: process.env.BET_API_URL,
    NEYNAR_API_KEY: process.env.NEYNAR_API_KEY,
    NAMESTONE_API_KEY: process.env.NAMESTONE_API_KEY,
    PRIVY_APP_ID_DEV: process.env.PRIVY_APP_ID_DEV,
    PRIVY_APP_ID_PROD: process.env.PRIVY_APP_ID_PROD,
    PRIVY_APP_SECRET_DEV: process.env.PRIVY_APP_SECRET_DEV,
    PRIVY_APP_SECRET_PROD: process.env.PRIVY_APP_SECRET_PROD,
  },
});
