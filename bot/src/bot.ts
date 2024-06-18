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

bot.post("/webhooks", (req: Request, res: Response) => {
  const eventData = req.body as EventData;
  const logs = eventData.event.data.block.logs;

  logs.forEach(async (log) => {
    const event = getEventNameFromSignature(log.topics[0]);
    try {
      if (event === "BetCreated") handleBetCreated(log);
      else if (event === "BetAccepted") handleBetAccepted(log);
      else if (event === "BetDeclined") handleBetDeclined(log);
      else if (event === "BetSettled") handleBetSettled(log);
      else {
        console.log("Unexpected data format received:\n" + log);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  res.status(200).send("Received");
});

export default bot;

async function handleBetCreated(log: Log) {
  // -> parse the new bet contract address
  const newContractAddress = getAddress(log.topics[1]);
  // -> add to webhook
  addAddressToWebhook(newContractAddress);
  // -> get bet info
  const { betId, creator, participant, amount } = await getBetDetails(
    newContractAddress
  );
  // -> cast about the bet creation
  const formattedCreator = shortenHexAddress(creator);
  const formattedParticipant = shortenHexAddress(participant);
  const castMessage = `${formattedCreator} offered a new ${amount} USDC bet to ${formattedParticipant}`;
  const frameUrl = `${FRAME_BASE_URL}/bet/${betId}`;
  await publishCast(castMessage, { frameUrl }); // optionally returns cast hash
}

async function handleBetAccepted(log: Log) {
  // -> parse contract address
  const betAddress = log.account.address;
  // -> get bet info
  const { betId, participant } = await getBetDetails(betAddress);
  // -> cast about the bet acceptance
  const formattedParticipant = shortenHexAddress(participant);
  const castMessage = `${formattedParticipant} accepted the bet! Awaiting the results...`;
  const frameUrl = `${FRAME_BASE_URL}/bet/${betId}`;
  await publishCast(castMessage, { frameUrl }); // optionally returns cast hash
}

async function handleBetDeclined(log: Log) {
  // -> parse contract address
  const betAddress = log.account.address;
  // -> remove contract address from webhook
  removeAddressFromWebhook(betAddress);
  // -> get bet info
  const { betId, participant } = await getBetDetails(betAddress);
  // -> cast about bet decline
  const formattedParticipant = shortenHexAddress(participant);
  const castMessage = `${formattedParticipant} declined the bet! Funds have been returned.`;
  const frameUrl = `${FRAME_BASE_URL}/bet/${betId}`;
  publishCast(castMessage, { frameUrl });
}

async function handleBetSettled(log: Log) {
  // -> parse contract address
  const betAddress = log.account.address;
  // -> remove contract address from webhook
  removeAddressFromWebhook(betAddress);
  // -> get bet info
  const { betId, arbitrator } = await getBetDetails(betAddress);
  const winner = await getBetWinner(betAddress);
  const isTie = winner === "0x0000000000000000000000000000000000000000";
  // -> cast about bet settled
  const formattedArbitrator = shortenHexAddress(arbitrator);
  const formattedWinner = shortenHexAddress(winner);
  const castMessage = `${formattedArbitrator} settled the bet. ${
    isTie ? "Both parties tied!" : `${formattedWinner} won!`
  }`;
  const frameUrl = `${FRAME_BASE_URL}/bet/${betId}`;
  publishCast(castMessage, { frameUrl });
}
