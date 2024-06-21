import express, { Express, Request, Response } from "express";
import { formatUnits, getAddress } from "viem";
import { publishCast } from "./neynar";
import { FRAME_BASE_URL } from "./config";
import { type EventData, type Log } from "./webhook";
import {
  getBetDetails,
  getEventNameFromSignature,
  getFarcasterNames,
} from "./utils";

const bot: Express = express();

bot.use(express.json());

bot.get("/", (req: Request, res: Response) => {
  res.send("WannaBet Bot Express Server");
});

bot.post("/test", async (req: Request, res: Response) => {
  console.log("Request received at", req.url);
  console.log("Data:", JSON.stringify(req.body));
  res.status(200).send("Received");
});

bot.post("/webhooks", async (req: Request, res: Response) => {
  console.log("Request received at", req.url);
  try {
    const eventData = req.body as EventData;
    const logs = eventData.event.data.block.logs;
    await Promise.all(
      logs.map(async (log) => {
        const event = getEventNameFromSignature(log.topics[0]);
        event ?? console.log("Received event:", event);
        switch (event) {
          case "BetCreated":
            await handleBetCreated(log);
            break;
          // case "BetAccepted":
          //   await handleBetAccepted(log);
          //   break;
          // case "BetDeclined":
          //   await handleBetDeclined(log);
          //   break;
          // case "BetSettled":
          //   await handleBetSettled(log);
          //   break;
          default:
            console.log(
              `Unexpected data format received:\n${JSON.stringify(log)}`
            );
        }
      })
    );
    res.status(200).send("Received");
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
});

export default bot;

async function handleBetCreated(log: Log) {
  // Parse the new bet contract address
  const newContractAddress = getAddress(log.topics[1]);
  // Fetch data
  const { betId, creator, participant, amount, message, arbitrator } =
    await getBetDetails(newContractAddress);
  const [creatorUsername, participantUsername, arbitratorUsername] =
    await getFarcasterNames([creator, participant, arbitrator]);
  // Create strings
  const formattedAmount = formatUnits(amount, 6);
  const frameUrl = `${FRAME_BASE_URL}/bet/${betId.toString()}`;
  const castMessage = `@${creatorUsername} bet @${participantUsername} ${formattedAmount} USDC that ${message}. @${arbitratorUsername} is arbitrator\n\n${frameUrl}`;
  // Cast
  await publishCast(castMessage, { frameUrl }); // optionally returns cast hash
}

// async function handleBetAccepted(log: Log) {
//   // Parse the bet contract address
//   const betAddress = log.account.address;
//   // Get bet info
//   const { betId, participant } = await getBetDetails(betAddress);
//   // Cast
//   const formattedParticipant = shortenHexAddress(participant);
//   const frameUrl = `${FRAME_BASE_URL}/bet/${betId}`;
//   const castMessage = `${formattedParticipant} accepted the bet! Awaiting the results...\n\n${frameUrl}`;
//   await publishCast(castMessage, { frameUrl }); // optionally returns cast hash
// }

// async function handleBetDeclined(log: Log) {
//   // Parse the bet contract address
//   const betAddress = log.account.address;
//   // Remove from webhook (stop listening for new events)
//   removeAddressFromWebhook(betAddress);
//   // Get bet info
//   const { betId, participant } = await getBetDetails(betAddress);
//   // Cast
//   const formattedParticipant = shortenHexAddress(participant);
//   const frameUrl = `${FRAME_BASE_URL}/bet/${betId}`;
//   const castMessage = `${formattedParticipant} declined the bet! Funds have been returned.\n\n${frameUrl}`;
//   publishCast(castMessage, { frameUrl }); // optionally returns cast hash
// }

// async function handleBetSettled(log: Log) {
//   // Parse the bet contract address
//   const betAddress = log.account.address;
//   // Remove from webhook (stop listening for new events)
//   removeAddressFromWebhook(betAddress);
//   // Get bet info
//   const { betId, arbitrator } = await getBetDetails(betAddress);
//   const winner = await getBetWinner(betAddress);
//   const isTie = winner === "0x0000000000000000000000000000000000000000";
//   // Cast
//   const formattedArbitrator = shortenHexAddress(arbitrator);
//   const formattedWinner = shortenHexAddress(winner);
//   const frameUrl = `${FRAME_BASE_URL}/bet/${betId}`;
//   const castMessage = `${formattedArbitrator} settled the bet. ${
//     isTie ? "Both parties tied!" : `${formattedWinner} won!`
//   }\n\n${frameUrl}`;
//   publishCast(castMessage, { frameUrl }); // optionally returns cast hash
// }
