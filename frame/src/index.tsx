import { Frog } from "frog";
import { type CustomEnv } from "./types";
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
app.frame("/bets/:betId", betScreen);
app.frame("/bets/:betId/accept", acceptScreen);
app.frame("/bets/:betId/settle", settleScreen);
app.frame("/bets/:betId/create/:pageNum", createScreen);

app.transaction("/tx/authorize", authorizeTxn);
app.transaction("/tx/create", createTxn);
app.transaction("/tx/accept", acceptTxn);
app.transaction("/tx/decline", declineTxn);
app.transaction("/tx/settle", settleTxn);
app.transaction("/tx/retrieve", retrieveTxn);

// devtools(app, { serveStatic });
export default app;
