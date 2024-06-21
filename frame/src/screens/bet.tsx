import { Button } from "frog";
import { backgroundStyles, subTextStyles, vStack } from "../shared-styles";
import { arbitrumClientFn } from "../viem";
import { betFactoryAbi } from "../contracts/betFactoryAbi";
import {
  MAINNET_ARBITRUM_USDC_CONTRACT_ADDRESS,
  MAINNET_BET_FACTORY_CONTRACT_ADDRESS,
} from "../contracts/addresses";
import { betAbi } from "../contracts/betAbi";
import {
  convertTimestampToFormattedDate,
  fetchUser,
  getBetDetails,
  getPreferredAlias,
  getPreferredAliasAndPfp,
} from "../utils";
import { FiatTokenProxyAbi } from "../contracts/usdcAbi";
import { type CustomFrameContext } from "..";
import { BetIdSchema } from "../zodSchemas";
import { BetAndUserInfoSection } from "../components";

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
    args: [BigInt(parsedBetId)],
  });

  // -> Check if start screen
  const { frameData, url } = c;
  let image: any, intents: any;
  if (frameData) {
    // -> Fail if bet doesn't exist yet
    if (contractAddress === "0x0000000000000000000000000000000000000000") {
      return c.res({
        image: (
          <div style={{ ...backgroundStyles }}>
            <span>Bet doesn&apos;t exist yet</span>
          </div>
        ),
        intents: [<Button action="/home" children={"Home"} />],
        title: "WannaBet",
      });
    }
    // -> Fetch bet details & status
    const [
      { creator, participant, arbitrator, amount, validUntil },
      winner,
      status,
      contractBalance,
      userData,
    ] = await Promise.all([
      getBetDetails(c, contractAddress),
      arbitrumClient.readContract({
        address: contractAddress,
        abi: betAbi,
        functionName: "winner",
      }),
      arbitrumClient.readContract({
        address: contractAddress,
        abi: betAbi,
        functionName: "getStatus",
      }),
      arbitrumClient.readContract({
        address: MAINNET_ARBITRUM_USDC_CONTRACT_ADDRESS,
        abi: FiatTokenProxyAbi,
        functionName: "balanceOf",
        args: [contractAddress],
      }),
      fetchUser(c.env.NEYNAR_API_KEY, frameData.fid),
    ]);
    // -> Check if user is in bet
    let isCreator = false,
      isParticipant = false,
      isArbitrator = false;
    const userAddressList = userData.users[0].verified_addresses.eth_addresses;
    userAddressList.forEach((address) => {
      if (address.toLowerCase() === creator.toLowerCase()) isCreator = true;
      if (address.toLowerCase() === participant.toLowerCase())
        isParticipant = true;
      if (address.toLowerCase() === arbitrator.toLowerCase())
        isArbitrator = true;
    });
    // -> Create conditional intents
    const backButton =
      c.initialPath === "/home"
        ? [<Button action="/home" children={"Home"} />]
        : [];
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
    const formattedDate = convertTimestampToFormattedDate(Number(validUntil));
    const [
      { preferredAlias: creatorAlias, preferredPfpUrl: creatorPfp },
      { preferredAlias: participantAlias, preferredPfpUrl: participantPfp },
      arbitratorAlias,
      winnerAlias,
    ] = await Promise.all([
      getPreferredAliasAndPfp(c, creator),
      getPreferredAliasAndPfp(c, participant),
      getPreferredAlias(c, arbitrator),
      getPreferredAlias(c, winner),
    ]);
    const formattedAmount = Number(amount) / 10 ** 6;
    // -> Set image and intents
    image = (
      <div style={{ ...backgroundStyles, justifyContent: "space-between" }}>
        <BetAndUserInfoSection
          betId={parsedBetId}
          creatorAlias={creatorAlias}
          creatorPfpUrl={creatorPfp}
          participantAlias={participantAlias}
          participantPfpUrl={participantPfp}
        />
        <div style={{ ...vStack }}>
          {status === "pending" && <span>Proposed, no response yet</span>}
          {status === "pending" && (
            <span style={{ ...subTextStyles }}>
              Offer expires {formattedDate}
            </span>
          )}
          {status === "accepted" && <span>Bet Accepted</span>}
          {status === "accepted" && (
            <span style={{ ...subTextStyles }}>
              {arbitratorAlias} to determine the winner
            </span>
          )}
          {status === "declined" && <span>Bet Declined</span>}
          {status === "declined" && (
            <span style={{ ...subTextStyles }}>
              {participantAlias} declined the bet and funds were returned
            </span>
          )}
          {status === "expired" && <span>Bet Expired</span>}
          {status === "expired" && (
            <span style={{ ...subTextStyles }}>
              {participantAlias} didn&apos;t respond in time and funds
              {Number(contractBalance) > 0
                ? ` are reclaimable by ${creatorAlias}`
                : ` were sent to ${creatorAlias}`}
            </span>
          )}
          {status === "settled" && (
            <span>{isTie ? "Tie!" : `${winnerAlias} won!`}</span>
          )}
          {status === "settled" && (
            <span style={{ ...subTextStyles }}>
              {arbitratorAlias} determined
              {isTie
                ? " the bet was a tie and funds were sent back equally"
                : ` ${winnerAlias} was the winner; they received ${
                    formattedAmount * 2
                  } USDC`}
            </span>
          )}
        </div>
        <div style={{ display: "flex" }} />
      </div>
    );
    intents = [
      ...backButton,
      ...participantButtons,
      ...arbitratorButtons,
      ...creatorButtons,
    ];
  } else {
    // -> Set image and intents
    image = (
      <div style={{ ...backgroundStyles, justifyContent: "center" }}>
        <span style={{ ...subTextStyles }}>{`Bet #${parsedBetId}`}</span>
        <span>Click to see status</span>
      </div>
    );
    intents = [
      <Button
        action={`/bet/${parsedBetId}`}
        value="refresh"
        children={"See Status"}
      />,
    ];
  }

  return c.res({
    image: image,
    intents: [
      ...intents,
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
};
