import { Frog } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";
import { FROG_SECRET } from "./config";

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

export const app = new Frog({
  browserLocation: "/",
  imageOptions: async () => ({ fonts: [await getFont("satoshi")] }),
  initialState: {
    participant: "",
    arbitrator: "",
    amount: 0,
    message: "",
    validForDays: 7,
  },
  secret: FROG_SECRET,
});

app.get("/", (ctx) => ctx.html(<Home />));

app.frame("/home", homeScreen);
app.frame("/bet/:betId", betScreen);
app.frame("/bet/:betId/accept", acceptScreen);
app.frame("/bet/:betId/settle", settleScreen);
app.frame("/bet/:betId/create/:pageNum", createScreen);

app.transaction("/tx/authorize/:sender", authorizeTxn);
app.transaction("/tx/create", createTxn);
app.transaction("/tx/accept/:contractAddress", acceptTxn);
app.transaction("/tx/decline/:contractAddress", declineTxn);
app.transaction("/tx/settle/:contractAddress/:winnerAddress", settleTxn);

devtools(app, { serveStatic });
export default app;
