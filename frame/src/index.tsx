import { Env, Frog } from "frog";
import { devtools } from "frog/dev";
import { serveStatic } from "frog/serve-static";

import { Home } from "./web";
import { getFont } from "./fonts";
import { homeScreen } from "./screens/home";
import { betScreen } from "./screens/bet";
import { createScreen } from "./screens/create";
import { FROG_SECRET } from "./config";

export const app = new Frog({
  browserLocation: "/",
  imageOptions: async () => ({ fonts: [await getFont("satoshi")] }),
  initialState: {
    participant: "",
    arbitrator: "",
    amount: 0,
    message: "",
  },
  secret: FROG_SECRET,
});

app.get("/", (ctx) => ctx.html(<Home />));
app.frame("/home", homeScreen);
app.frame("/bet/:betId", betScreen);
app.frame("/bet/:betId/create/:pageNum", createScreen);

devtools(app, { serveStatic });
export default app;
