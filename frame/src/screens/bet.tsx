import { Button } from "frog";
import { backgroundStyles, subTextStyles } from "../shared-styles";
import { arbitrumClientFn } from "../viem";
import { betFactoryAbi } from "../contracts/betFactoryAbi";
import {
  MAINNET_ARBITRUM_USDC_CONTRACT_ADDRESS,
  MAINNET_BET_FACTORY_CONTRACT_ADDRESS,
} from "../contracts/addresses";
import { betAbi } from "../contracts/betAbi";
import {
  capitalizeFirstLetter,
  fetchUser,
  getBetDetails,
  getPreferredAlias,
} from "../utils";
import { FiatTokenProxyAbi } from "../contracts/usdcAbi";
import { type CustomFrameContext } from "..";
import { BetIdSchema } from "../zodSchemas";

export const betScreen = async (c: CustomFrameContext<"/bet/:betId">) => {
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

  const betCount = await arbitrumClient.readContract({
    address: MAINNET_BET_FACTORY_CONTRACT_ADDRESS,
    abi: betFactoryAbi,
    functionName: "betCount",
  });
  if (parsedBetId > betCount) {
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span>Bet doesn't exist yet</span>
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
  const contractBalance = await arbitrumClient.readContract({
    address: MAINNET_ARBITRUM_USDC_CONTRACT_ADDRESS,
    abi: FiatTokenProxyAbi,
    functionName: "balanceOf",
    args: [contractAddress],
  });
  const { creator, participant, amount, message, arbitrator } =
    await getBetDetails(c, contractAddress);
  const status = await arbitrumClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "getStatus",
  });
  const winner = await arbitrumClient.readContract({
    address: contractAddress,
    abi: betAbi,
    functionName: "winner",
  });

  const [creatorAlias, participantAlias, winnerAlias] = await Promise.all([
    getPreferredAlias(c, creator),
    getPreferredAlias(c, participant),
    getPreferredAlias(c, winner),
  ]);

  const { frameData, url } = c;

  // -> get user addresses
  const apiKey = c.env.NEYNAR_API_KEY;
  const userData = await fetchUser(apiKey, frameData!.fid);
  const userAddressList = userData.users[0].verified_addresses.eth_addresses;

  // -> check if at least one address is involved in the bet
  let isCreator = false,
    isParticipant = false,
    isArbitrator = false;
  userAddressList.forEach((address) => {
    const lcAddress = address.toLowerCase();
    if (lcAddress === creator.toLowerCase()) isCreator = true;
    if (lcAddress === participant.toLowerCase()) isParticipant = true;
    if (lcAddress === arbitrator.toLowerCase()) isArbitrator = true;
  });

  const isTie = winner !== creator && winner !== participant;

  const convertedAmount = Number(amount) / 10 ** 6;

  const participantButtons =
    isParticipant && status === "pending"
      ? [
          <Button.Transaction
            action={`${url}/accept`}
            target={`/tx/authorize?spender=${contractAddress}&amount=${amount}`}
            children={"Accept"}
          />,
          <Button.Transaction
            action={url}
            target={`/tx/decline?contract=${contractAddress}`}
            children={"Decline"}
          />,
        ]
      : [];
  const arbitratorButtons =
    isArbitrator && status === "accepted"
      ? [<Button action={`${url}/settle`} children={"Settle"} />]
      : [];
  const creatorButtons =
    isCreator && status === "expired" && Number(contractBalance) > 0
      ? [
          <Button.Transaction
            target={`/tx/retrieve?contract=${contractAddress}`}
            children={"Retrieve funds"}
          />,
        ]
      : [];

  return c.res({
    image: (
      <div style={{ ...backgroundStyles }}>
        <span>WannaBet #{betId}</span>
        <span style={{ ...subTextStyles, marginTop: 20 }}>
          <span style={{ textDecorationLine: "underline", marginRight: 12 }}>
            {creatorAlias}
          </span>
          {" bet "}
          <span
            style={{
              textDecorationLine: "underline",
              marginLeft: 12,
              marginRight: 12,
            }}
          >
            {participantAlias}
          </span>
          {convertedAmount} USDC that:
        </span>
        <span
          style={{
            ...subTextStyles,
            marginTop: 30,
            marginBottom: 48,
            color: "lightGreen",
            padding: 8,
            paddingLeft: 36,
            borderLeft: "4px",
          }}
        >
          {message}.
        </span>
        {status === "pending" && (
          <span style={{ ...subTextStyles }}>
            {capitalizeFirstLetter(status)}: {participantAlias} can accept or
            decline
          </span>
        )}
        {status === "expired" && (
          <span style={{ ...subTextStyles }}>
            {capitalizeFirstLetter(status)}: {participantAlias} didn't accept in
            time. The bet creator can retrieve their funds.
          </span>
        )}
        {status === "declined" && (
          <span style={{ ...subTextStyles }}>
            {capitalizeFirstLetter(status)}: {participantAlias} declined the bet
          </span>
        )}
        {status === "accepted" && (
          <span style={{ ...subTextStyles }}>
            {capitalizeFirstLetter(status)}: Awaiting {arbitrator}&apos;s
            decision
          </span>
        )}
        {status === "settled" && (
          <span style={{ ...subTextStyles }}>
            {capitalizeFirstLetter(status)}:{" "}
            {isTie
              ? "The bet tied and the pot was split."
              : `${winnerAlias} won.`}
          </span>
        )}
      </div>
    ),
    intents: [
      ...participantButtons,
      ...arbitratorButtons,
      ...creatorButtons,
      <Button.Link
        href={`https://arbiscan.io/address/${contractAddress}`}
        children={"Arbiscan"}
      />,
      <Button
        action={`${url}/create/1`}
        value="create"
        children={"Create new"}
      />,
    ],
  });
};
