import { Button, FrameContext, TextInput } from "frog";
import { backgroundStyles } from "../shared-styles";

export const homeScreen = async (c: FrameContext) => {
  return c.res({
    // browserLocation: "/frame",
    image: (
      <div style={{ ...backgroundStyles }}>
        <span>Wanna Bet?</span>
      </div>
    ),
    intents: [
      <Button action="/create/1" children={"Create new"} />,
      <Button action="/bets" children={"My bets"} />,
    ],
  });
};
