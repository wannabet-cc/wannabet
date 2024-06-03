import { Button, FrameContext } from "frog";
import { backgroundStyles } from "../shared-styles";

export const homeScreen = async (c: FrameContext) => {
  return c.res({
    image: (
      <div style={{ ...backgroundStyles }}>
        <span>Wanna Bet?</span>
      </div>
    ),
    intents: [
      <Button action="/create/1" value="create" children={"Create new"} />,
    ],
  });
};
