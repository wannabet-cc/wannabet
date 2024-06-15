import { Button } from "frog";
import { backgroundStyles, subTextStyles } from "../shared-styles";
import { arbitrumClientFn } from "../viem";
import { betFactoryAbi } from "../contracts/betFactoryAbi";
import { MAINNET_BET_FACTORY_CONTRACT_ADDRESS } from "../contracts/addresses";
import { getBetDetails, getPreferredAlias } from "../utils";
import { type CustomFrameContext } from "..";
import { BetIdSchema } from "../zodSchemas";

export const settleScreen = async (
  c: CustomFrameContext<"/bet/:betId/settle">
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
  const betHomeUrl = `/bet/${parsedBetId}`;

  const arbitrumClient = arbitrumClientFn(c);

  const contractAddress = await arbitrumClient.readContract({
    address: MAINNET_BET_FACTORY_CONTRACT_ADDRESS,
    abi: betFactoryAbi,
    functionName: "betAddresses",
    args: [BigInt(betId)],
  });
  const { creator, participant, message } = await getBetDetails(
    c,
    contractAddress
  );
  const tieAddress = "0x0000000000000000000000000000000000000000"; // Zeros as winner means tie

  const [creatorAlias, participantAlias] = await Promise.all([
    getPreferredAlias(c, creator),
    getPreferredAlias(c, participant),
  ]);

  return c.res({
    image: (
      <div style={{ ...backgroundStyles }}>
        <span>Choose the winner of bet #{parsedBetId}</span>
        <span
          style={{
            ...subTextStyles,
            marginTop: 30,
            color: "lightBlue",
            paddingLeft: 40,
            borderLeft: "4px",
          }}
        >
          {message}
        </span>
        <span style={{ ...subTextStyles, marginTop: 30 }}>
          {creatorAlias} if true; {participantAlias} if false
        </span>
      </div>
    ),
    intents: [
      <Button action={betHomeUrl} children={"Back"} />,
      <Button.Transaction
        action={betHomeUrl}
        target={`/tx/settle?contract=${contractAddress}&winner=${creator}`}
        children={creatorAlias}
      />,
      <Button.Transaction
        action={betHomeUrl}
        target={`/tx/settle?contract=${contractAddress}&winner=${participant}`}
        children={participantAlias}
      />,
      <Button.Transaction
        action={betHomeUrl}
        target={`/tx/settle?contract=${contractAddress}&winner=${tieAddress}`}
        children={"Tie"}
      />,
    ],
  });
};
