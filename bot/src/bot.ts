import express, { Express, Request, Response } from "express";
import { getAddress } from "viem";
import { publishCast } from "./neynar";
import { FRAME_BASE_URL } from "./config";
import {
  type EventData,
  type Log,
  addAddressToWebhook,
  removeAddressFromWebhook,
} from "./webhook";
import {
  getBetDetails,
  getBetWinner,
  getEventNameFromSignature,
  shortenHexAddress,
} from "./utils";

const bot: Express = express();

bot.use(express.json());

bot.get("/", (req: Request, res: Response) => {
  res.send("WannaBet Bot Express Server");
});

bot.post("/webhooks", async (req: Request, res: Response) => {
  try {
    const eventData = req.body as EventData;
    const logs = eventData.event.data.block.logs;
    await Promise.all(
      logs.map(async (log) => {
        const event = getEventNameFromSignature(log.topics[0]);
        event ?? console.log("Received event:", event);
        switch (event) {
          case "BetCreated":
            handleBetCreated(log);
            break;
          case "BetAccepted":
            handleBetAccepted(log);
            break;
          case "BetDeclined":
            handleBetDeclined(log);
            break;
          case "BetSettled":
            handleBetSettled(log);
            break;
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
  // Add to webhook
  addAddressToWebhook(newContractAddress);
  // Get bet info
  const { betId, creator, participant, amount } = await getBetDetails(
    newContractAddress
  );
  // Cast
  const formattedCreator = shortenHexAddress(creator);
  const formattedParticipant = shortenHexAddress(participant);
  const castMessage = `${formattedCreator} offered a new ${amount} USDC bet to ${formattedParticipant}`;
  const frameUrl = `${FRAME_BASE_URL}/bet/${betId}`;
  await publishCast(castMessage, { frameUrl }); // optionally returns cast hash
}

async function handleBetAccepted(log: Log) {
  // Parse the bet contract address
  const betAddress = log.account.address;
  // Get bet info
  const { betId, participant } = await getBetDetails(betAddress);
  // Cast
  const formattedParticipant = shortenHexAddress(participant);
  const castMessage = `${formattedParticipant} accepted the bet! Awaiting the results...`;
  const frameUrl = `${FRAME_BASE_URL}/bet/${betId}`;
  await publishCast(castMessage, { frameUrl }); // optionally returns cast hash
}

async function handleBetDeclined(log: Log) {
  // Parse the bet contract address
  const betAddress = log.account.address;
  // Remove from webhook (stop listening for new events)
  removeAddressFromWebhook(betAddress);
  // Get bet info
  const { betId, participant } = await getBetDetails(betAddress);
  // Cast
  const formattedParticipant = shortenHexAddress(participant);
  const castMessage = `${formattedParticipant} declined the bet! Funds have been returned.`;
  const frameUrl = `${FRAME_BASE_URL}/bet/${betId}`;
  publishCast(castMessage, { frameUrl }); // optionally returns cast hash
}

async function handleBetSettled(log: Log) {
  // Parse the bet contract address
  const betAddress = log.account.address;
  // Remove from webhook (stop listening for new events)
  removeAddressFromWebhook(betAddress);
  // Get bet info
  const { betId, arbitrator } = await getBetDetails(betAddress);
  const winner = await getBetWinner(betAddress);
  const isTie = winner === "0x0000000000000000000000000000000000000000";
  // Cast
  const formattedArbitrator = shortenHexAddress(arbitrator);
  const formattedWinner = shortenHexAddress(winner);
  const castMessage = `${formattedArbitrator} settled the bet. ${
    isTie ? "Both parties tied!" : `${formattedWinner} won!`
  }`;
  const frameUrl = `${FRAME_BASE_URL}/bet/${betId}`;
  publishCast(castMessage, { frameUrl }); // optionally returns cast hash
}
