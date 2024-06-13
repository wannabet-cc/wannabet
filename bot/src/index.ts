// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Address } from "viem";

dotenv.config();

const app: Express = express();

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express Server");
});

const betCreatedSignature =
  "0xeb61722110fd856b0d96d3312d86d62fcda6eee1eee2366d2c10e1d564d120e8";
const betAcceptedSignature =
  "0xdd6dae32994530eefb2d3b21473a19ec9f41d294a4fd6353b9b16d2d2c674b96";
const betDeclinedSignature =
  "0x815a1274b6d601b9c13c3a4ca7a73f7f180c6808c6b73b68360880ab923d979a";
const betSettledSignature =
  "0x1263c5e68e09cb9dfb7e7df0f53d955963a974e73d6ef177fadeb882cd9629ab";

app.post("/webhooks", (req: Request, res: Response) => {
  const eventData = req.body as EventData;
  const logData = eventData.event.data.block.logs;

  logData.forEach((log) => {
    const eventSignature = log.topics[0];
    if (eventSignature === betCreatedSignature) {
      // handle bet creation
    } else if (eventSignature === betAcceptedSignature) {
      // handle bet accepted
    } else if (eventSignature === betDeclinedSignature) {
      // handle bet declined
    } else if (eventSignature === betSettledSignature) {
      // handle bet settled
    } else {
      // handle error
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
    address: string;
  };
  transaction: {
    hash: string;
    nonce: number;
    index: number;
    from: {
      address: string;
    };
    to: {
      address: string;
    };
    value: string;
  };
};

async function addAddress(new_address: Address) {
  console.log("Adding address " + new_address);

  const url = "https://dashboard.alchemy.com/api/graphql/variables/addressList";
  const body = { add: [new_address] };
  try {
    const res = await fetch(url, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        "X-Alchemy-Token": process.env.ALCHEMY_TOKEN || "",
      },
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

async function removeAddress(old_address: Address) {
  console.log("Removing address " + old_address);

  const url = "https://dashboard.alchemy.com/api/graphql/variables/addressList";
  const body = { delete: [old_address] };
  try {
    const res = await fetch(url, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        "X-Alchemy-Token": process.env.ALCHEMY_TOKEN || "",
      },
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
