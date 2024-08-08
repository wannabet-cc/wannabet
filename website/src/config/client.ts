import { env } from "@/env/client";

// Alchemy
export const MAINNET_ALCHEMY_URL = env.NEXT_PUBLIC_MAINNET_ALCHEMY_URL;
export const BASE_ALCHEMY_URL = env.NEXT_PUBLIC_BASE_ALCHEMY_URL;
export const ARB_ALCHEMY_URL = env.NEXT_PUBLIC_ARB_ALCHEMY_URL;

// Privy
export const PRIVY_APP_ID = env.NEXT_PUBLIC_PRIVY_APP_ID_DEV || env.NEXT_PUBLIC_PRIVY_APP_ID_PROD;
