// Sensitive info
// export const MAINNET_ALCHEMY_URL = process.env.MAINNET_ALCHEMY_URL;
// export const ARBITRUM_ALCHEMY_URL = process.env.ARBITRUM_ALCHEMY_URL;
export const MAINNET_ALCHEMY_URL = process.env.NEXT_PUBLIC_MAINNET_ALCHEMY_URL;
export const ARBITRUM_ALCHEMY_URL =
  process.env.NEXT_PUBLIC_ARBITRUM_ALCHEMY_URL;

// Smart contract constants
export const BET_FACTORY_CONTRACT_ADDRESS =
  "0xC1C9046D6356c68b478092Fb907CD256EFc0dDa2";
export const USDC_CONTRACT_ADDRESS =
  "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

// Urls & other
export const BET_API_URL =
  process.env.NEXT_PUBLIC_BET_API_URL ||
  "https://wanna-bet-production.up.railway.app/";
