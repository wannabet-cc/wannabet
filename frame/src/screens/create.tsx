import { Button, FrameContext, TextInput } from "frog";
import { backgroundStyles } from "../shared-styles";
import { Address, isAddress } from "viem";
import { z } from "zod";
import type { BetInfoState } from "../types";

export const createScreen = async (
  c: FrameContext<{ State: BetInfoState }, "/create/:pageNum">
) => {
  const pageNum = Number(c.req.param().pageNum);
  const PageNumberSchema = z.number().positive().int().gte(1).lte(7);
  const { success } = PageNumberSchema.safeParse(pageNum);
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

  if (pageNum === 1) {
    // Reset state if coming from home page
    const { buttonValue, deriveState } = c;
    if (buttonValue === "create") {
      const state = deriveState((previousState) => {
        previousState.participant = "";
        previousState.arbitrator = "";
        previousState.amount = 0;
        previousState.message = "";
      });
    }
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{pageNum}/7</span>
          <span>Who are you betting with?</span>
        </div>
      ),
      intents: [
        <TextInput placeholder="e.g. 0xabc..." />,
        <Button action={`/home`} value="back" children={"Back"} />,
        <Button
          action={`/create/${pageNum + 1}`}
          value="continue"
          children={"Continue"}
        />,
      ],
    });
  } else if (pageNum === 2) {
    // Validate address and set state
    const { buttonValue } = c;
    if (buttonValue === "continue") {
      // Check if input is valid, go back if not
      const { inputText, deriveState } = c;
      const AddressSchema = z.custom<Address>(isAddress, "Invalid Address");
      const { success, data } = AddressSchema.safeParse(inputText);
      if (!success) {
        return c.res({
          image: (
            <div style={{ ...backgroundStyles }}>
              <span style={{ color: "gray" }}>{pageNum - 1}/7</span>
              <span>error - Input needs to be a valid address</span>
            </div>
          ),
          intents: [
            <Button action={`/create/${pageNum - 1}`} children="Back" />,
          ],
        });
      }
      // Update state
      const state = deriveState((previousState) => {
        previousState.participant = data;
      });
    }
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{pageNum}/7</span>
          <span>How much USDC do you want to bet?</span>
        </div>
      ),
      intents: [
        <TextInput placeholder="e.g. 5" />,
        <Button
          action={`/create/${pageNum - 1}`}
          value="back"
          children={"Back"}
        />,
        <Button
          action={`/create/${pageNum + 1}`}
          value="continue"
          children={"Continue"}
        />,
      ],
    });
  } else if (pageNum === 3) {
    // Validate amount and set state
    const { buttonValue } = c;
    if (buttonValue === "continue") {
      // Check if input is valid, go back if not
      const { inputText, deriveState } = c;
      const NumberSchema = z
        .number()
        .positive()
        .int()
        .safe()
        .lte(5000, "For the moment, the max bet is $5k");
      const { success, data } = NumberSchema.safeParse(Number(inputText));
      if (!success)
        return c.res({
          image: (
            <div style={{ ...backgroundStyles }}>
              <span style={{ color: "gray" }}>{pageNum - 1}/7</span>
              <span>
                {"error - Input needs to be a positive integer <= $5k"}
              </span>
            </div>
          ),
          intents: [
            <Button action={`/create/${pageNum - 1}`} children="Back" />,
          ],
        });
      // Update state
      const state = deriveState((previousState) => {
        previousState.amount = data;
      });
    }
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{pageNum}/7</span>
          <span>What are the terms?</span>
        </div>
      ),
      intents: [
        <TextInput placeholder="e.g. ETH price will be $5k by..." />,
        <Button
          action={`/create/${pageNum - 1}`}
          value="back"
          children={"Back"}
        />,
        <Button
          action={`/create/${pageNum + 1}`}
          value="continue"
          children={"Continue"}
        />,
      ],
    });
  } else if (pageNum === 4) {
    // Validate message and set state
    const { buttonValue } = c;
    if (buttonValue === "continue") {
      const { inputText, deriveState } = c;
      // Update state
      const state = deriveState((previousState) => {
        previousState.message = inputText ? inputText : "";
      });
    }
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{pageNum}/7</span>
          <span>Who would you like to arbitrate?</span>
        </div>
      ),
      intents: [
        <TextInput placeholder="e.g. 0xabc..." />,
        <Button
          action={`/create/${pageNum - 1}`}
          value="back"
          children={"Back"}
        />,
        <Button
          action={`/create/${pageNum + 1}`}
          value="continue"
          children={"Continue"}
        />,
      ],
    });
  } else if (pageNum === 5) {
    // Validate address and set state
    const { buttonValue } = c;
    if (buttonValue === "continue") {
      // Check if input is valid, go back if not
      const { inputText, deriveState } = c;
      const AddressSchema = z.custom<Address>(isAddress, "Invalid Address");
      const { success, data } = AddressSchema.safeParse(inputText);
      if (!success)
        return c.res({
          image: (
            <div style={{ ...backgroundStyles }}>
              <span style={{ color: "gray" }}>{pageNum - 1}/7</span>
              <span>error - Input needs to be a valid address</span>
            </div>
          ),
          intents: [
            <Button action={`/create/${pageNum - 1}`} children="Back" />,
          ],
        });
      // Update state
      const state = deriveState((previousState) => {
        previousState.arbitrator = data;
      });
    }
    // Return frame
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
        <Button
          action={`/create/${pageNum - 1}`}
          value="back"
          children={"Back"}
        />,
        <Button.Transaction
          action={`/create/${pageNum + 1}`}
          target="/tx/authorize"
          children={"Authorize"}
        />,
      ],
    });
  } else if (pageNum === 6) {
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{pageNum}/7</span>
          <span>Deploy your bet</span>
          <span style={{ ...subTextStyles }}></span>
        </div>
      ),
      intents: [
        <Button
          action={`/create/${pageNum - 1}`}
          value="back"
          children={"Back"}
        />,
        <Button
          action={`/create/${pageNum + 1}`}
          value="continue"
          children={"Continue"}
        />,
      ],
    });
  } else if (pageNum === 7) {
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{pageNum}/7</span>
          <span>Bet created! Share.</span>
        </div>
      ),
      intents: [<Button action="/home" children={"Home"} />],
    });
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
