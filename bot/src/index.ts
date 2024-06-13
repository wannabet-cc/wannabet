// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Address } from "viem";
import { ethers } from "ethers";
import { publishCast } from "./neynar";
import { arbitrumSepoliaClient } from "./viem";
import { betAbi } from "./contracts/betAbi";
import {
  BET_ACCEPTED_EVENT_SIGNATURE,
  BET_CREATED_EVENT_SIGNATURE,
  BET_DECLINED_EVENT_SIGNATURE,
  BET_SETTLED_EVENT_SIGNATURE,
  FRAME_BASE_URL,
} from "./config";
import { addAddress, removeAddress } from "./webhook";

dotenv.config();

const app: Express = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express Server");
});

const castMap = new Map();

app.post("/webhooks", (req: Request, res: Response) => {
  const eventData = req.body as EventData;
  const logData = eventData.event.data.block.logs;

  logData.forEach(async (log) => {
    const eventSignature = log.topics[0];
    if (eventSignature === BET_CREATED_EVENT_SIGNATURE) {
      // HANDLE BET CREATION
      try {
        // -> parse new contract address
        const newContractAddress = ethers.getAddress(log.topics[1]) as Address;
        // -> add new contract address to webhook
        addAddress(newContractAddress);
        // -> get bet info
        const { betId, creator, participant, amount } = await getBetDetails(
          newContractAddress
        );
        // -> cast about the bet creation
        const castMessage = `${creator} offered a new ${amount} USDC bet to ${participant}`;
        const frameUrl = `${FRAME_BASE_URL}/bet/${betId}`;
        const parentHash = await publishCast(castMessage, { frameUrl });
        // -> add to cast directory
        castMap.set(betId, parentHash);
      } catch (err) {
        // -> handle error
        console.error(err);
      }
    } else if (eventSignature === BET_ACCEPTED_EVENT_SIGNATURE) {
      // HANDLE BET ACCEPTED
      try {
      // -> parse contract address
        const betAddress = log.account.address;
        // -> get bet info
        const { betId, participant } = await getBetDetails(betAddress);
        // -> cast about the bet acceptance
        const castHash = castMap.get(Number(betId));
        const castMessage = `${participant} accepted the bet! Awaiting the results...`;
        publishCast(castMessage, { replyToCastHash: castHash });
      } catch (err) {
        // -> handle error
        console.error(err);
      }
    } else if (eventSignature === BET_DECLINED_EVENT_SIGNATURE) {
      // HANDLE BET DECLINED
      try {
      // -> parse contract address
        const betAddress = log.account.address;
        // -> remove contract address from webhook
        removeAddress(betAddress);
        // -> get bet info
        const { betId, participant } = await getBetDetails(betAddress);
      // -> cast about bet decline
        const castHash = castMap.get(Number(betId));
        const castMessage = `${participant} declined the bet! Funds have been returned.`;
        publishCast(castMessage, { replyToCastHash: castHash });
        // -> remove from cast directory
        castMap.delete(betId);
      } catch (err) {
        // -> handle error
        console.log(err);
      }
    } else if (eventSignature === BET_SETTLED_EVENT_SIGNATURE) {
      // HANDLE BET SETTLED
      // -> parse contract address
      // -> cast about bet settled
      // -> remove contract address from webhook
    } else {
      // handle error... unexpected scenario
    }
  });

  res.status(200).send("Received");
});

type EventData = {
  webhookId: string;
  id: string;
  createdAt: string;
  type: string;
  event: {
    data: {
      block: {
        number: number;
        timestamp: number;
        logs: Log[];
      };
    };
    sequenceNumber: string;
  };
};
type Log = {
  data: string;
  topics: string[];
  index: number;
  account: {
    address: Address;
  };
  transaction: {
    hash: string;
    nonce: number;
    index: number;
    from: {
      address: Address;
    };
    to: {
      address: Address;
    };
    value: string;
  };
};

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
  ] = await arbitrumSepoliaClient.readContract({
    address: betContractAddress,
    abi: betAbi,
    functionName: "getBetDetails",
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
