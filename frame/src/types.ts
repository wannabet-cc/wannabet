import {
  type Context,
  type FrameContext,
  type TransactionContext,
  type ImageContext,
} from "frog";
import type { Context as Context_hono } from "hono";
import { Address } from "viem";

// Custom Context
export type CustomEnv = {
  Bindings: {
    NEYNAR_API_KEY: string;
    MAINNET_ALCHEMY_URL: string;
    ARBITRUM_ALCHEMY_URL: string;
  };
  State: {
    participant: Address | string;
    arbitrator: Address | string;
    amount: number;
    message: string;
    validForDays: number;
  };
};
export type CustomEnvVars<
  env extends CustomEnv = CustomEnv,
  path extends string = string
> = Context_hono<env, path>["env"];

export type CustomContext<path extends string = string> = Context<
  CustomEnv,
  path
>;
export type CustomFrameContext<path extends string = string> = FrameContext<
  CustomEnv,
  path
>;
export type CustomTransactionContext<path extends string = string> =
  TransactionContext<CustomEnv, path>;
export type CustomImageContext<path extends string = string> = ImageContext<
  CustomEnv,
  path
>;
