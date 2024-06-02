import { Button, Env, FrameContext, TextInput } from "frog";
import { backgroundStyles } from "../shared-styles";
import { isIntInRange } from "./utils";
import { Address } from "viem";

type BetInfoState = Env & {
  participant: Address;
  arbitrator: Address;
  amount: number;
  terms: string;
};

export const createScreen = async (
  c: FrameContext<{ State: BetInfoState }, "/create/:pageNum">
) => {
  const pageNum = Number(c.req.param().pageNum);
  if (!isIntInRange(pageNum, 1, 7)) {
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
            <span style={{ color: "gray" }}>{pageNum}/7</span>
            <span>Who are you betting with?</span>
          </div>
        ),
        intents: [
          <TextInput placeholder="e.g. example.eth or 0xabc..." />,
          <Button action={`/home`} children={"Back"} />,
          <Button action={`/create/${pageNum + 1}`} children={"Continue"} />,
        ],
      });
    case 2:
      return c.res({
        image: (
          <div style={{ ...backgroundStyles }}>
            <span style={{ color: "gray" }}>{pageNum}/7</span>
            <span>Who would you like to arbitrate?</span>
          </div>
        ),
        intents: [
          <TextInput placeholder="e.g. example.eth or 0xabc..." />,
          <Button action={`/create/${pageNum - 1}`} children={"Back"} />,
          <Button action={`/create/${pageNum + 1}`} children={"Continue"} />,
        ],
      });
    case 3:
      return c.res({
        image: (
          <div style={{ ...backgroundStyles }}>
            <span style={{ color: "gray" }}>{pageNum}/7</span>
            <span>How much USDC do you want to bet?</span>
          </div>
        ),
        intents: [
          <TextInput placeholder="e.g. 5" />,
          <Button action={`/create/${pageNum - 1}`} children={"Back"} />,
          <Button action={`/create/${pageNum + 1}`} children={"Continue"} />,
        ],
      });
    case 4:
      return c.res({
        image: (
          <div style={{ ...backgroundStyles }}>
            <span style={{ color: "gray" }}>{pageNum}/7</span>
            <span>What are the terms?</span>
          </div>
        ),
        intents: [
          <TextInput placeholder="e.g. ETH price will be $5k by..." />,
          <Button action={`/create/${pageNum - 1}`} children={"Back"} />,
          <Button action={`/create/${pageNum + 1}`} children={"Continue"} />,
        ],
      });
    case 5:
      return c.res({
        image: (
          <div style={{ ...backgroundStyles }}>
            <span style={{ color: "gray" }}>{pageNum}/7</span>
            <span>
              Authorize the contract to move your wager to the bet contract
            </span>
          </div>
        ),
        intents: [
          <Button action={`/create/${pageNum - 1}`} children={"Back"} />,
          <Button action={`/create/${pageNum + 1}`} children={"Continue"} />,
        ],
      });
    case 6:
      return c.res({
        image: (
          <div style={{ ...backgroundStyles }}>
            <span style={{ color: "gray" }}>{pageNum}/7</span>
            <span>Deploy your bet</span>
          </div>
        ),
        intents: [
          <Button action={`/create/${pageNum - 1}`} children={"Back"} />,
          <Button action={`/create/${pageNum + 1}`} children={"Continue"} />,
        ],
      });
    case 7:
      return c.res({
        image: (
          <div style={{ ...backgroundStyles }}>
            <span style={{ color: "gray" }}>{pageNum}/7</span>
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
