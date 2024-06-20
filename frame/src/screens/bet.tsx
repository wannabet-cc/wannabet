import { Button } from "frog";
import { backgroundStyles, subTextStyles } from "../shared-styles";
import { arbitrumClientFn } from "../viem";
import { betFactoryAbi } from "../contracts/betFactoryAbi";
import {
  MAINNET_ARBITRUM_USDC_CONTRACT_ADDRESS,
  MAINNET_BET_FACTORY_CONTRACT_ADDRESS,
} from "../contracts/addresses";
import { betAbi } from "../contracts/betAbi";
import { fetchUser, getBetDetails, getPreferredAlias } from "../utils";
import { FiatTokenProxyAbi } from "../contracts/usdcAbi";
import { type CustomFrameContext } from "..";
import { BetIdSchema } from "../zodSchemas";

export const betScreen = async (c: CustomFrameContext<"/bet/:betId">) => {
  // -> Validate url
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
      title: "WannaBet",
    });
  }

  // -> Fetch contract address
  const arbitrumClient = arbitrumClientFn(c);
  const contractAddress = await arbitrumClient.readContract({
    address: MAINNET_BET_FACTORY_CONTRACT_ADDRESS,
    abi: betFactoryAbi,
    functionName: "betAddresses",
    args: [BigInt(betId)],
  });

  // -> Check if start screen
  const { frameData, url } = c;
  if (frameData) {
    // -> Fetch bet details & status
    const { creator, participant, arbitrator, amount } = await getBetDetails(
      c,
      contractAddress
    );
    const winner = await arbitrumClient.readContract({
      address: contractAddress,
      abi: betAbi,
      functionName: "winner",
    });
    const status = await arbitrumClient.readContract({
      address: contractAddress,
      abi: betAbi,
      functionName: "getStatus",
  });
  const contractBalance = await arbitrumClient.readContract({
    address: MAINNET_ARBITRUM_USDC_CONTRACT_ADDRESS,
    abi: FiatTokenProxyAbi,
    functionName: "balanceOf",
    args: [contractAddress],
  });
    // -> Check if user is in bet
  let isCreator = false,
    isParticipant = false,
    isArbitrator = false;
    const userData = await fetchUser(c.env.NEYNAR_API_KEY, frameData.fid);
    const userAddressList = userData.users[0].verified_addresses.eth_addresses;
  userAddressList.forEach((address) => {
      if (address.toLowerCase() === creator.toLowerCase()) isCreator = true;
      if (address.toLowerCase() === participant.toLowerCase())
        isParticipant = true;
      if (address.toLowerCase() === arbitrator.toLowerCase())
        isArbitrator = true;
  });
    // -> Create conditional intents
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
    // -> Re-format fetched data
    const isTie =
      status === "settled" && winner !== creator && winner !== participant;

    const winnerAlias = await getPreferredAlias(c, winner);
    // -> Return screen
  return c.res({
    image: (
      <div style={{ ...backgroundStyles }}>
          <span style={{ ...subTextStyles }}>{`Bet #${betId}`}</span>
          {status === "pending" && <span>Proposed, no response yet</span>}
          {status === "accepted" && <span>Bet Accepted</span>}
          {status === "declined" && <span>Bet Declined</span>}
          {status === "expired" && <span>Bet Expired</span>}
        {status === "settled" && (
            <span>{isTie ? "Tie!" : `${winnerAlias} won!`}</span>
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
    title: "WannaBet",
  });
  } else {
    // -> Return start screen
    return c.res({
      image: (
        <div style={{ ...backgroundStyles }}>
          <span style={{ ...subTextStyles }}>{`Bet #${betId}`}</span>
          <span>Click to see status</span>
        </div>
      ),
      intents: [
        <Button
          action={`/bet/${betId}`}
          value="refresh"
          children={"See Status"}
        />,
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
      title: "WannaBet",
    });
  }
};
