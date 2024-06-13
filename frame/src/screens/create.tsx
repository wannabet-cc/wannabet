import { Button, FrameContext, TextInput } from "frog";
import { backgroundStyles, subTextStyles } from "../shared-styles";
import { Address, isAddress } from "viem";
import { z } from "zod";
import type { BetInfoState } from "../types";
import { MAINNET_BET_FACTORY_CONTRACT_ADDRESS } from "../contracts/addresses";

export const createScreen = async (
  c: FrameContext<{ State: BetInfoState }, "/bet/:betId/create/:pageNum">
) => {
  // Validate params
  const { betId, pageNum } = c.req.param();
  const BetIdSchema = z.number().positive().int();
  const { success: betIdSuccess, data: parsedBetId } = BetIdSchema.safeParse(
    Number(betId)
  );
  const PageNumSchema = z.number().positive().int().lte(8);
  const { success: pageNumSuccess, data: parsedPageNum } =
    PageNumSchema.safeParse(Number(pageNum));
  const betUrl = `/bet/${parsedBetId}`;
  const nextPageUrl = parsedPageNum
    ? `${betUrl}/create/${parsedPageNum + 1}`
    : betUrl;
  const prevPageUrl = parsedPageNum
    ? `${betUrl}/create/${parsedPageNum - 1}`
    : betUrl;
  if (!betIdSuccess || !pageNumSuccess) {
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span>Bad url</span>
        </div>
      ),
      intents: [
        <Button action={betIdSuccess ? betUrl : "/home"} children={"Back"} />,
      ],
    });
  }

  if (parsedPageNum === 1) {
    // Reset state if going forward
    const { buttonValue, deriveState } = c;
    if (buttonValue === "create") {
      const state = deriveState((previousState) => {
        previousState.participant = "";
        previousState.arbitrator = "";
        previousState.amount = 0;
        previousState.message = "";
        previousState.validForDays = 7;
      });
    }
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{parsedPageNum}/8</span>
          <span>Who are you betting with?</span>
        </div>
      ),
      intents: [
        <TextInput placeholder="e.g. 0xabc..." />,
        <Button action={betUrl} value="back" children={"Back"} />,
        <Button action={nextPageUrl} value="continue" children={"Continue"} />,
      ],
    });
  } else if (parsedPageNum === 2) {
    // Validate address and set state
    const { buttonValue, frameData } = c;
    if (buttonValue === "continue") {
      // Check if input is valid, go back if not
      const { inputText, deriveState } = c;
      const AddressSchema = z.custom<Address>(isAddress, "Invalid Address");
      const { success, data: parsedParticipant } =
        AddressSchema.safeParse(inputText);
      const isBetWithSelf = frameData?.address == parsedParticipant;
      if (!success || isBetWithSelf) {
        return c.res({
          image: (
            <div style={{ ...backgroundStyles }}>
              <span style={{ color: "gray" }}>{parsedPageNum - 1}/8</span>
              <span>error - Input needs to be a valid address</span>
            </div>
          ),
          intents: [<Button action={prevPageUrl} children="Back" />],
        });
      }
      // Update state
      const state = deriveState((previousState) => {
        previousState.participant = parsedParticipant;
      });
    }
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{parsedPageNum}/8</span>
          <span>How much USDC do you want to bet?</span>
        </div>
      ),
      intents: [
        <TextInput placeholder="e.g. 5" />,
        <Button action={prevPageUrl} value="back" children={"Back"} />,
        <Button action={nextPageUrl} value="continue" children={"Continue"} />,
      ],
    });
  } else if (parsedPageNum === 3) {
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
              <span style={{ color: "gray" }}>{parsedPageNum - 1}/8</span>
              <span>
                {"error - Input needs to be a positive integer <= $5k"}
              </span>
            </div>
          ),
          intents: [<Button action={prevPageUrl} children="Back" />],
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
          <span style={{ color: "gray" }}>{parsedPageNum}/8</span>
          <span>What are the terms?</span>
        </div>
      ),
      intents: [
        <TextInput placeholder="e.g. ETH price will be $5k by..." />,
        <Button action={prevPageUrl} value="back" children={"Back"} />,
        <Button action={nextPageUrl} value="continue" children={"Continue"} />,
      ],
    });
  } else if (parsedPageNum === 4) {
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
          <span style={{ color: "gray" }}>{parsedPageNum}/8</span>
          <span>How many days should the offer be valid for?</span>
        </div>
      ),
      intents: [
        <TextInput placeholder="e.g. 7" />,
        <Button action={prevPageUrl} value="back" children={"Back"} />,
        <Button action={nextPageUrl} value="continue" children={"Continue"} />,
      ],
    });
  } else if (parsedPageNum === 5) {
    // Validate amount and set state
    const { buttonValue } = c;
    if (buttonValue === "continue") {
      // Check if input is valid, go back if not
      const { inputText, deriveState } = c;
      const NumberSchema = z.number().positive().int().lte(14);
      const { success, data } = NumberSchema.safeParse(Number(inputText));
      if (!success)
        return c.res({
          image: (
            <div style={{ ...backgroundStyles }}>
              <span style={{ color: "gray" }}>{parsedPageNum - 1}/8</span>
              <span>
                {"error - Input needs to be a positive integer <= 14"}
              </span>
            </div>
          ),
          intents: [<Button action={prevPageUrl} children="Back" />],
        });
      // Update state
      const state = deriveState((previousState) => {
        previousState.validForDays = data;
      });
    }
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{parsedPageNum}/8</span>
          <span>Who would you like to arbitrate?</span>
        </div>
      ),
      intents: [
        <TextInput placeholder="e.g. 0xabc..." />,
        <Button action={prevPageUrl} value="back" children={"Back"} />,
        <Button action={nextPageUrl} value="continue" children={"Continue"} />,
      ],
    });
  } else if (parsedPageNum === 6) {
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
              <span style={{ color: "gray" }}>{parsedPageNum - 1}/8</span>
              <span>error - Input needs to be a valid address</span>
            </div>
          ),
          intents: [<Button action={prevPageUrl} children="Back" />],
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
          <span style={{ color: "gray" }}>{parsedPageNum}/8</span>
          <span>
            Authorize the contract to move your wager to the bet contract
          </span>
        </div>
      ),
      intents: [
        <Button action={prevPageUrl} value="back" children={"Back"} />,
        <Button action={nextPageUrl} value="continue" children={"Continue"} />, // Temporary button for bypassing the transaction frame in the create bet workflow
        <Button.Transaction
          action={nextPageUrl}
          target={`/tx/authorize/${MAINNET_BET_FACTORY_CONTRACT_ADDRESS}`}
          children={"Authorize"}
        />,
      ],
    });
  } else if (parsedPageNum === 7) {
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{parsedPageNum}/8</span>
          <span>Deploy your bet</span>
          <span style={{ ...subTextStyles }}></span>
        </div>
      ),
      intents: [
        <Button action={prevPageUrl} value="back" children={"Back"} />,
        <Button action={nextPageUrl} value="continue" children={"Continue"} />, // Temporary button for bypassing the transaction frame in the create bet workflow
        <Button.Transaction
          action={nextPageUrl}
          target="/tx/create"
          children={"Create bet"}
        />,
      ],
    });
  } else {
    // Return frame
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ color: "gray" }}>{parsedPageNum}/8</span>
          <span>Bet created!</span>
        </div>
      ),
      intents: [<Button action={betUrl} children={"Finish"} />],
    });
  }
};
