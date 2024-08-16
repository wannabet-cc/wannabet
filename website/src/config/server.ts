import { env } from "@/env/server";

// Alchemy
export const MAINNET_ALCHEMY_URL = env.MAINNET_ALCHEMY_URL;
export const BASE_ALCHEMY_URL = env.BASE_ALCHEMY_URL;
export const ARB_ALCHEMY_URL = env.ARB_ALCHEMY_URL;

// Api
export const BET_API_URL = env.BET_API_URL;

// Neynar
export const NEYNAR_API_KEY = env.NEYNAR_API_KEY;

// NameStone
export const NAMESTONE_API_KEY = env.NAMESTONE_API_KEY;

// Privy
export const PRIVY_APP_ID = env.PRIVY_APP_ID_DEV || env.PRIVY_APP_ID_PROD;
export const PRIVY_APP_SECRET = env.PRIVY_APP_SECRET_DEV || env.PRIVY_APP_SECRET_PROD;
