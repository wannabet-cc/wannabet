import { Button, Env, FrameContext, TextInput } from "frog";
import { backgroundStyles } from "../shared-styles";

export const createScreen = async (
  c: FrameContext<Env, "/create/:pageNum">
) => {
  const pageNum = Number(c.req.param().pageNum);
  if (
    !(typeof pageNum === "number") ||
    pageNum % 1 !== 0 ||
    pageNum < 1 ||
    pageNum > 7
  ) {
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span>Bad url</span>
        </div>
      ),
      intents: [<Button action={`/home`} children={"Home"} />],
    });
  }

  switch (pageNum) {
    case 1:
      return c.res({
        image: (
          <div style={{ ...backgroundStyles }}>
            <span>Who are you betting with?</span>
          </div>
        ),
        intents: [
          <TextInput placeholder="e.g. example.eth or 0xabc..." />,
          <Button action={`/create/${2}`} children={"Continue"} />,
        ],
      });
    case 2:
      return c.res({
        image: (
          <div style={{ ...backgroundStyles }}>
            <span>Who would you like to arbitrate?</span>
          </div>
        ),
        intents: [
          <TextInput placeholder="e.g. example.eth or 0xabc..." />,
          <Button action={`/create/${3}`} children={"Continue"} />,
        ],
      });
    case 3:
      return c.res({
        image: (
          <div style={{ ...backgroundStyles }}>
            <span>How much USDC do you want to bet?</span>
          </div>
        ),
        intents: [
          <TextInput placeholder="e.g. 5" />,
          <Button action={`/create/${4}`} children={"Continue"} />,
        ],
      });
    case 4:
      return c.res({
        image: (
          <div style={{ ...backgroundStyles }}>
            <span>What are the terms?</span>
          </div>
        ),
        intents: [
          <TextInput placeholder="e.g. ETH price will be $5k by..." />,
          <Button action={`/create/${5}`} children={"Continue"} />,
        ],
      });
    case 5:
      return c.res({
        image: (
          <div style={{ ...backgroundStyles }}>
            <span>
              Authorize the contract to move your wager to the bet contract
            </span>
          </div>
        ),
        intents: [<Button action={`/create/${6}`} children={"Authorize"} />],
      });
    case 6:
      return c.res({
        image: (
          <div style={{ ...backgroundStyles }}>
            <span>Deploy your bet</span>
          </div>
        ),
        intents: [<Button action={`/create/${7}`} children={"Deploy"} />],
      });
    case 7:
      return c.res({
        image: (
          <div style={{ ...backgroundStyles }}>
            <span>Bet created! Share.</span>
          </div>
        ),
        intents: [<Button action="/home" children={"Home"} />],
      });
    default:
      null;
  }

  return c.res({
    image: (
      <div style={{ ...backgroundStyles }}>
        <span></span>
      </div>
    ),
    intents: [
      <TextInput placeholder="" />,
      <Button action="/home" children={"Continue"} />,
    ],
  });
};
