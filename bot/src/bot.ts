import express, { Express, Request, Response } from "express";
import { Address, getAddress } from "viem";
import { publishCast } from "./neynar";
import { arbitrumClient } from "./viem";
import { betAbi } from "./contracts/betAbi";
import {
  BET_ACCEPTED_EVENT_SIGNATURE,
  BET_CREATED_EVENT_SIGNATURE,
  BET_DECLINED_EVENT_SIGNATURE,
  BET_SETTLED_EVENT_SIGNATURE,
  FRAME_BASE_URL,
} from "./config";
import { type EventData, type Log, addAddress, removeAddress } from "./webhook";
import { shortenHexAddress } from "./utils";

const bot: Express = express();

bot.use(express.json());

bot.get("/", (req: Request, res: Response) => {
  res.send("WannaBet Bot Express Server");
});

bot.post("/webhooks", (req: Request, res: Response) => {
  const eventData = req.body as EventData;
  const logData = eventData.event.data.block.logs;

  logData.forEach(async (log) => {
    const eventSignature = log.topics[0];
    try {
      if (eventSignature === BET_CREATED_EVENT_SIGNATURE) {
        // HANDLE BET CREATION
        handleBetCreated(log);
      } else if (eventSignature === BET_ACCEPTED_EVENT_SIGNATURE) {
        // HANDLE BET ACCEPTED
        handleBetAccepted(log);
      } else if (eventSignature === BET_DECLINED_EVENT_SIGNATURE) {
        // HANDLE BET DECLINED
        handleBetDeclined(log);
      } else if (eventSignature === BET_SETTLED_EVENT_SIGNATURE) {
        // HANDLE BET SETTLED
        handleBetSettled(log);
      } else {
        console.log("Unexpected data received:\n" + log);
      }
    } catch (error) {
      console.error(error);
    }
  });

  res.status(200).send("Received");
});

export default bot;

async function handleBetCreated(log: Log) {
  // -> parse the new bet contract address
  const newContractAddress = getAddress(log.topics[1]);
  // -> add to webhook
  addAddress(newContractAddress);
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
  removeAddress(betAddress);
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
  removeAddress(betAddress);
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

async function getBetDetails(betContractAddress: Address) {
  const [
    betId,
    creator,
    participant,
    amount,
    token,
    message,
    arbitrator,
    validUntil,
  ] = await arbitrumClient.readContract({
    address: betContractAddress,
    abi: betAbi,
    functionName: "betDetails",
    args: [],
  });
  return {
    betId,
    creator,
    participant,
    amount,
    token,
    message,
    arbitrator,
    validUntil,
  };
}
async function getBetWinner(betContractAddress: Address) {
  const winner = await arbitrumClient.readContract({
    address: betContractAddress,
    abi: betAbi,
    functionName: "winner",
  });
  return winner;
}
