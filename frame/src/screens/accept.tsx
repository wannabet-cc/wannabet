import { Button, Env, FrameContext } from "frog";
import { backgroundStyles } from "../shared-styles";
import { z } from "zod";
import { arbitrumClient } from "../viem";
import { betFactoryAbi } from "../contracts/betFactoryAbi";
import { MAINNET_BET_FACTORY_CONTRACT_ADDRESS } from "../contracts/addresses";

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

  const contractAddress = await arbitrumClient.readContract({
    address: MAINNET_BET_FACTORY_CONTRACT_ADDRESS,
    abi: betFactoryAbi,
    functionName: "betAddresses",
    args: [BigInt(betId)],
  });

  return c.res({
    image: (
      <div style={{ ...backgroundStyles }}>
        <span>Accept bet #{parsedBetId}?</span>
      </div>
    ),
    intents: [
      <Button.Transaction
        action={`/bet/${parsedBetId}`}
        target={`/tx/accept?contract=${contractAddress}`}
        children={"Accept"}
      />,
    ],
  });
};
