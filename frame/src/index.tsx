import { Frog } from "frog";

import { Home } from "./web";
import { getFont } from "./fonts";
import { startScreen } from "./screens/start";

export const app = new Frog({
  browserLocation: "/",
  imageOptions: async () => ({ fonts: [await getFont("satoshi")] }),
});

app.get("/", (ctx) => ctx.html(<Home />));
app.frame("/start", startScreen);

export default app;
