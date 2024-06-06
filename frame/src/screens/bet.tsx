import { Button, Env, FrameContext } from "frog";
import { backgroundStyles, subTextStyles } from "../shared-styles";
import { z } from "zod";
import { arbitrumSepoliaClient } from "../viem";
import { betFactoryAbi } from "../contracts/betFactoryAbi";
import { TESTNET_BET_FACTORY_CONTRACT_ADDRESS } from "../contracts/addresses";
import { betAbi } from "../contracts/betAbi";
import { shortenHexAddress } from "../utils";

export const betScreen = async (c: FrameContext<Env, "/bet/:betId">) => {
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
  const isActive = await arbitrumSepoliaClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "isBetActive",
  });
  const isExpired = await arbitrumSepoliaClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "isOfferExpired",
  });
  const accepted = await arbitrumSepoliaClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "accepted",
  });
  const settled = await arbitrumSepoliaClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "settled",
  });
  const creator = await arbitrumSepoliaClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "CREATOR",
  });
  const amount = await arbitrumSepoliaClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "AMOUNT",
  });
  const convertedAmount = Number(amount) / 10 ** 6;
  const message = await arbitrumSepoliaClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "MESSAGE",
  });
  const participant = await arbitrumSepoliaClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "PARTICIPANT",
  });
  const arbitrator = await arbitrumSepoliaClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "ARBITRATOR",
  });
  const winner = await arbitrumSepoliaClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "winner",
  });

  const { frameData, url } = c;

  const isCreator = frameData?.address === creator;
  const isParticipant = frameData?.address === participant;
  const isArbitrator = frameData?.address === arbitrator;

  return c.res({
    image: (
      <div style={{ ...backgroundStyles }}>
        <span>
          WannaBet #{betId}
          {isActive ? " - Active" : isExpired ? " - Expired" : " - Settled"}
        </span>
        <span style={{ ...subTextStyles, marginTop: 20 }}>
          <span style={{ textDecorationLine: "underline", marginRight: 10 }}>
            {shortenHexAddress(creator)}
          </span>
          {" bet "}
          <span
            style={{
              textDecorationLine: "underline",
              marginLeft: 10,
              marginRight: 10,
            }}
          >
            {shortenHexAddress(participant)}
          </span>
        </span>
        <span style={{ ...subTextStyles, marginTop: 10 }}>
          ${convertedAmount} USDC that:
        </span>
        <span
          style={{
            ...subTextStyles,
            marginTop: 30,
            color: "lightBlue",
            paddingLeft: 40,
            borderLeft: "4px",
          }}
        >
          {message}.
        </span>
        {isActive ? (
          accepted ? (
            <span style={{ ...subTextStyles, marginTop: 50 }}>
              <span style={{ marginRight: 10 }}>
                {shortenHexAddress(participant)}
              </span>
              accepted! Awaiting result.
            </span>
          ) : (
            <span style={{ ...subTextStyles, marginTop: 50 }}>
              <span style={{ marginRight: 10 }}>
                {shortenHexAddress(participant)}
              </span>
              can accept or decline.
            </span>
          )
        ) : isExpired ? (
          <span style={{ ...subTextStyles, marginTop: 50 }}>
            <span style={{ marginRight: 10 }}>
              {shortenHexAddress(participant)}
            </span>
            failed to accept in time. The bet creator can retrieve their funds.
          </span>
        ) : accepted ? (
          <span style={{ ...subTextStyles, marginTop: 50 }}>
            {winner === "0x0000000000000000000000000000000000000000" ? (
              <>The bet was a tie</>
            ) : (
              <>
                <span style={{ marginRight: 10 }}>
                  {shortenHexAddress(winner)}
                </span>
                won the bet!
              </>
            )}
          </span>
        ) : (
          <span style={{ ...subTextStyles, marginTop: 50 }}>
            <span style={{ marginRight: 10 }}>
              {shortenHexAddress(participant)}
            </span>
            Declined the bet.
          </span>
        )}
      </div>
    ),
    intents: [
      <Button.Link
        href={`https://sepolia.arbiscan.io/address/${contractAddress}`}
        children={"Etherscan"}
      />,
      <Button
        action={`${url}/create/1`}
        value="create"
        children={"Create new"}
      />,
      isParticipant && !accepted && isActive ? (
        <Button.Transaction
          action={`${url}/accept`}
          target={`/tx/authorize/${contractAddress}`}
          children={"Authorize"}
        />
      ) : null,
      isParticipant && !accepted && isActive ? (
        <Button.Transaction
          action={url}
          target={`/tx/decline/${contractAddress}`}
          children={"Decline"}
        />
      ) : null,
      isArbitrator && accepted && isActive ? (
        <Button action={`${url}/settle`} children={"Settle"} />
      ) : null,
      isCreator && isExpired && !settled ? (
        <Button.Transaction
          target={`/tx/retrieve/${contractAddress}`}
          children={"Retrieve funds"}
        />
      ) : null,
    ],
  });
};
