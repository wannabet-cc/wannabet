import { Button, TextInput } from "frog";
import { backgroundStyles, subTextStyles } from "../shared-styles";
import { z } from "zod";
import { type CustomFrameContext } from "..";

export const homeScreen = async (c: CustomFrameContext<"/home">) => {
  const { inputText } = c;
  if (inputText) {
    const BetIdSchema = z.number().positive().int();
    const { success, data: parsedBetId } = BetIdSchema.safeParse(
      Number(inputText)
    );
    if (!success) {
      return c.res({
        image: (
          <div style={{ ...backgroundStyles }}>
            <span>Bad input</span>
            <span style={{ ...subTextStyles }}>
              Bet id should be a positive int
            </span>
          </div>
        ),
        intents: [<Button action={`/home`} children={"Home"} />],
      });
    }
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span>Go to bet #{parsedBetId}?</span>
        </div>
      ),
      intents: [
        <Button action="/home" children={"Back"} />,
        <Button action={`/bet/${parsedBetId}`} children={"Yes"} />,
      ],
    });
  }

  return c.res({
    image: (
      <div style={{ ...backgroundStyles }}>
        <span>Wanna Bet?</span>
        <span style={{ ...subTextStyles }}>Please enter a bet id</span>
      </div>
    ),
    intents: [
      <TextInput placeholder="e.g. 1" />,
      <Button action="/home" children={"Continue"} />,
    ],
  });
};
