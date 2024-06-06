import { Button, Env, FrameContext } from "frog";
import { backgroundStyles, subTextStyles } from "../shared-styles";
import { z } from "zod";
import { arbitrumSepoliaClient } from "../viem";
import { betFactoryAbi } from "../contracts/betFactoryAbi";
import { TESTNET_BET_FACTORY_CONTRACT_ADDRESS } from "../contracts/addresses";
import { betAbi } from "../contracts/betAbi";

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

  const contractAddress = await arbitrumSepoliaClient.readContract({
    address: TESTNET_BET_FACTORY_CONTRACT_ADDRESS,
    abi: betFactoryAbi,
    functionName: "betAddresses",
    args: [BigInt(betId)],
  });
  const creator = await arbitrumSepoliaClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "CREATOR",
  });
  const participant = await arbitrumSepoliaClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "PARTICIPANT",
  });
  const burnAddress = "0x0000000000000000000000000000000000000000"; // Selecting the burn address as winner means tie
  const message = await arbitrumSepoliaClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "MESSAGE",
  });

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
          Creator if true; Participant if false
        </span>
      </div>
    ),
    intents: [
      <Button action={betHomeUrl} children={"Back"} />,
      <Button.Transaction
        action={betHomeUrl}
        target={`/tx/settle/${contractAddress}/${creator}`}
        children={"Creator"}
      />,
      <Button.Transaction
        action={betHomeUrl}
        target={`/tx/settle/${contractAddress}/${participant}`}
        children={"Participant"}
      />,
      <Button.Transaction
        action={betHomeUrl}
        target={`/tx/settle/${contractAddress}/${burnAddress}`}
        children={"Tie"}
      />,
    ],
  });
};
