import { Button, Env, FrameContext } from "frog";
import { backgroundStyles, subTextStyles } from "../shared-styles";
import { z } from "zod";
import { arbitrumClient } from "../viem";
import { betFactoryAbi } from "../contracts/betFactoryAbi";
import { MAINNET_BET_FACTORY_CONTRACT_ADDRESS } from "../contracts/addresses";
import { betAbi } from "../contracts/betAbi";
import { shortenHexAddress } from "../utils";

export const settleScreen = async (
  c: FrameContext<Env, "/bet/:betId/settle">
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
  const betHomeUrl = `/bet/${parsedBetId}`;

  const contractAddress = await arbitrumClient.readContract({
    address: MAINNET_BET_FACTORY_CONTRACT_ADDRESS,
    abi: betFactoryAbi,
    functionName: "betAddresses",
    args: [BigInt(betId)],
  });
  const [
    _betId,
    creator,
    participant,
    amount,
    token,
    message,
    arbitrator,
    validUntil,
  ] = await arbitrumClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "betDetails",
    args: [],
  });
  const tieAddress = "0x0000000000000000000000000000000000000000"; // Zeros as winner means tie

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
          {shortenHexAddress(creator)} if true; {shortenHexAddress(participant)}{" "}
          if false
        </span>
      </div>
    ),
    intents: [
      <Button action={betHomeUrl} children={"Back"} />,
      <Button.Transaction
        action={betHomeUrl}
        target={`/tx/settle?contract=${contractAddress}&winner=${creator}`}
        children={shortenHexAddress(creator)}
      />,
      <Button.Transaction
        action={betHomeUrl}
        target={`/tx/settle?contract=${contractAddress}&winner=${participant}`}
        children={shortenHexAddress(participant)}
      />,
      <Button.Transaction
        action={betHomeUrl}
        target={`/tx/settle?contract=${contractAddress}&winner=${tieAddress}`}
        children={"Tie"}
      />,
    ],
  });
};
