import {
  Frog,
  type Context,
  type FrameContext,
  type TransactionContext,
} from "frog";
// import { devtools } from "frog/dev";
// import { serveStatic } from "frog/serve-static";

import { Home } from "./web";
import { getFont } from "./fonts";

import { homeScreen } from "./screens/home";
import { betScreen } from "./screens/bet";
import { acceptScreen } from "./screens/accept";
import { settleScreen } from "./screens/settle";
import { createScreen } from "./screens/create";

import { authorizeTxn } from "./tx/authorize";
import { createTxn } from "./tx/create";
import { acceptTxn } from "./tx/accept";
import { declineTxn } from "./tx/decline";
import { settleTxn } from "./tx/settle";
import { retrieveTxn } from "./tx/retrieve";
import { Address } from "viem";

type CustomEnv = {
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

export const app = new Frog<CustomEnv>({
  browserLocation: "/",
  imageOptions: async () => ({ fonts: [await getFont("satoshi")] }),
  initialState: {
    participant: "",
    arbitrator: "",
    amount: 0,
    message: "",
    validForDays: 7,
  },
  secret: "FbbrOev9A1f0XcH7GFrlocTQ+3TNq1wHPCi28M5s1Tk=",
});

app.get("/", (ctx) => ctx.html(<Home />));

app.frame("/home", homeScreen);
app.frame("/bet/:betId", betScreen);
app.frame("/bet/:betId/accept", acceptScreen);
app.frame("/bet/:betId/settle", settleScreen);
app.frame("/bet/:betId/create/:pageNum", createScreen);

app.transaction("/tx/authorize", authorizeTxn);
app.transaction("/tx/create", createTxn);
app.transaction("/tx/accept", acceptTxn);
app.transaction("/tx/decline", declineTxn);
app.transaction("/tx/settle", settleTxn);
app.transaction("/tx/retrieve", retrieveTxn);

// devtools(app, { serveStatic });
export default app;
