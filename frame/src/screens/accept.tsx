import { Button, Env, FrameContext } from "frog";
import { backgroundStyles, subTextStyles } from "../shared-styles";
import { z } from "zod";
import { arbitrumSepoliaClient } from "../viem";
import { betFactoryAbi } from "../contracts/betFactoryAbi";
import { TESTNET_BET_FACTORY_CONTRACT_ADDRESS } from "../contracts/addresses";

export const acceptScreen = async (
  c: FrameContext<Env, "/bet/:betId/accept">
) => {
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

  const contractAddress = await arbitrumSepoliaClient.readContract({
    address: TESTNET_BET_FACTORY_CONTRACT_ADDRESS,
    abi: betFactoryAbi,
    functionName: "betAddresses",
    args: [BigInt(betId)],
  });

  const { url } = c;

  return c.res({
    image: (
      <div style={{ ...backgroundStyles }}>
        <span>Accept bet #{parsedBetId}?</span>
      </div>
    ),
    intents: [
      <Button action={`/bet/${parsedBetId}`} children={"Accept"} />, // Added to bypass txn for testing
      <Button.Transaction
        action={`/bet/${parsedBetId}`}
        target={`/tx/accept/${contractAddress}`}
        children={"Accept"}
      />,
    ],
  });
};
