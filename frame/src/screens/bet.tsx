import { Button, Env, FrameContext } from "frog";
import { backgroundStyles } from "../shared-styles";
import { z } from "zod";

export const betScreen = async (c: FrameContext<Env, "/bet/:betId">) => {
  const { betId } = c.req.param();
  const BetIdSchema = z.number().positive().int();
  const { success, data: parsedBetId } = BetIdSchema.safeParse(Number(betId));
  if (!success) {
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span>Bad url</span>
        </div>
      ),
      intents: [<Button action={`/home`} children={"Home"} />],
    });
  }
  return c.res({
    image: (
      <div style={{ ...backgroundStyles }}>
        <span>WannaBet #{betId}</span>
      </div>
    ),
    intents: [
      <Button children={"Etherscan"} />,
      <Button
        action={`/bet/${betId}/create/1`}
        value="create"
        children={"Create new"}
      />,
    ],
  });
};
