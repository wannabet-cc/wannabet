import { Button, FrameContext, TextInput } from "frog";
import { backgroundStyles } from "../shared-styles";

export const homeScreen = async (c: FrameContext) => {
  return c.res({
    // browserLocation: "/frame",
    image: (
      <div style={{ ...backgroundStyles }}>
        <span>Home</span>
      </div>
    ),
    intents: [<TextInput placeholder="ETH Amount" />],
  });
};
