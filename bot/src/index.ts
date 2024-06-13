// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Address } from "viem";
import { ethers } from "ethers";
import neynarClient from "./neynar";
import { isApiErrorResponse } from "@neynar/nodejs-sdk";
import { arbitrumSepoliaClient } from "./viem";
import { betAbi } from "./contracts/betAbi";
import {
  BET_ACCEPTED_EVENT_SIGNATURE,
  BET_CREATED_EVENT_SIGNATURE,
  BET_DECLINED_EVENT_SIGNATURE,
  BET_SETTLED_EVENT_SIGNATURE,
  FRAME_BASE_URL,
  SIGNER_UUID,
  WANNA_BET_CHANNEL_ID,
} from "./config";
import { addAddress } from "./webhook";

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
      // -> parse contract address
      // -> cast about bet decline
      // -> remove contract address from webhook
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

const publishCast = async (
  message: string,
  options: {
    replyToCastHash?: string;
    frameUrl?: string;
  }
) => {
  try {
    // -> use neynarClient to publish the cast
    const neynarOptions = {
      replyTo: options.replyToCastHash,
      channelId: WANNA_BET_CHANNEL_ID,
      embeds: options.frameUrl ? [{ url: options.frameUrl }] : undefined,
    };
    const res = await neynarClient.publishCast(
      SIGNER_UUID,
      message,
      neynarOptions
    );
    console.log("Cast published successfully");
    return res.hash;
  } catch (err) {
    // -> check if API response error
    if (isApiErrorResponse(err)) {
      console.log(err.response.data);
    } else console.log(err);
  }
};

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
