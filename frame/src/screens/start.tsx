import { Button, FrameContext } from "frog";

import { backgroundStyles } from "../shared-styles";

export const startScreen = async (c: FrameContext) => {
  return c.res({
    image: (
      <div style={{ ...backgroundStyles }}>
        <span>Start</span>
      </div>
    ),
    intents: [<Button action="/start">Next</Button>],
  });
};
