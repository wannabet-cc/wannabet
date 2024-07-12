import express, { Express, Request, Response } from "express";
import { Hex, decodeEventLog, formatUnits } from "viem";
import { publishCast } from "./neynar";
import { BET_CREATED_EVENT_SIGNATURE } from "./config";
import { type EventData, type Log } from "./webhook";
import {
  getBetDetails,
  getEventNameFromSignature,
  getFarcasterNames,
  getPreferredAliases,
} from "./utils";
import { BetFactoryAbi } from "./contracts/BetFactoryAbi";
import { baseClient } from "./viem";

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
  const decodedTopics = decodeEventLog({
    abi: BetFactoryAbi,
    eventName: "BetCreated",
    data: log.data as Hex,
    topics: [
      BET_CREATED_EVENT_SIGNATURE,
      ...log.topics.slice(1, 4).map((topic) => topic as Hex),
    ],
  });
  const newContractAddress = decodedTopics.args.contractAddress;
  // Wait for contract to be posted
  await baseClient.waitForTransactionReceipt({ hash: log.transaction.hash });
  // Fetch data
  const { betId, creator, participant, amount, message, judge } =
    await getBetDetails(newContractAddress);
  const [creatorUsername, participantUsername, judgeUsername] =
    await getPreferredAliases([creator, participant, judge]);
  // Create strings
  const formattedAmount = formatUnits(amount, 6),
    url = "https://wannabet.cc/",
    castMessage = `@${creatorUsername} bet @${participantUsername} ${formattedAmount} USDC that \`${message}\`. @${judgeUsername} is the judge\n\n${url}`;
  console.log(castMessage);
  // Cast
  await publishCast(castMessage); // optionally returns cast hash
}
