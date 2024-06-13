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

app.post("/webhooks", (req: Request, res: Response) => {
  const eventData = req.body as EventData;
  const logData = eventData.event.data.block.logs;
  if (logData) console.log("Log received:", eventData);

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
