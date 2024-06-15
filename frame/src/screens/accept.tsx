import { Button } from "frog";
import { backgroundStyles } from "../shared-styles";
import { arbitrumClientFn } from "../viem";
import { betFactoryAbi } from "../contracts/betFactoryAbi";
import { MAINNET_BET_FACTORY_CONTRACT_ADDRESS } from "../contracts/addresses";
import { type CustomFrameContext } from "..";
import { BetIdSchema } from "../zodSchemas";

export const acceptScreen = async (
  c: CustomFrameContext<"/bet/:betId/accept">
) => {
  const { betId } = c.req.param();
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

  const arbitrumClient = arbitrumClientFn(c);

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
