// Sensitive info
export const MAINNET_ALCHEMY_URL = process.env.MAINNET_ALCHEMY_URL || "";
export const BASE_ALCHEMY_URL = process.env.BASE_ALCHEMY_URL || "";
export const ARB_ALCHEMY_URL = process.env.ARB_ALCHEMY_URL || "";

// Smart contract constants
// Chain: Base
export const BASE_BET_FACTORY_ADDRESS = "0x304Ac36402D551fBba8e53E04e770337022e8757";
export const BASE_USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export const BASE_WETH_ADDRESS = "0x4200000000000000000000000000000000000006";
export const BASE_RETH_ADDRESS = "0xB6fe221Fe9EeF5aBa221c348bA20A1Bf5e73624c";
// Chain: Arbitrum
export const ARB_BET_FACTORY_ADDRESS = "0xC1C9046D6356c68b478092Fb907CD256EFc0dDa2";
export const ARB_USDC_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";

// Urls & other
export const BET_API_URL =
  process.env.BET_API_URL || "https://wanna-bet-production.up.railway.app/";
