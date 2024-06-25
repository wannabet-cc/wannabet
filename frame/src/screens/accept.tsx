import { Button } from "frog";
import { backgroundStyles, subTextStyles } from "../shared-styles";
import { arbitrumClientFn } from "../viem";
import { betFactoryAbi } from "../contracts/betFactoryAbi";
import { MAINNET_BET_FACTORY_CONTRACT_ADDRESS } from "../contracts/addresses";
import { type CustomFrameContext } from "../types";
import { BetIdSchema } from "../zodSchemas";
import { getBetDetails } from "../utils";
import { formatUnits } from "viem";

export const acceptScreen = async (
  c: CustomFrameContext<"/bets/:betId/accept">
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

  const arbitrumClient = arbitrumClientFn(c.env);

  const contractAddress = await arbitrumClient.readContract({
    address: MAINNET_BET_FACTORY_CONTRACT_ADDRESS,
    abi: betFactoryAbi,
    functionName: "betAddresses",
    args: [BigInt(betId)],
  });
  const { amount } = await getBetDetails(c.env, contractAddress);
  const numAmount = formatUnits(amount, 6);

  return c.res({
    image: (
      <div style={{ ...backgroundStyles }}>
        <span style={{ ...subTextStyles, marginBottom: 0 }}>
          You just authorized transferring {numAmount} USDC...
        </span>
        <span>Accept bet #{parsedBetId}?</span>
      </div>
    ),
    intents: [
      <Button.Transaction
        action={`/bets/${parsedBetId}`}
        target={`/tx/accept?contract=${contractAddress}`}
        children={"Accept"}
      />,
    ],
  });
};
