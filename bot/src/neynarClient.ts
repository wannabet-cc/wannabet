import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import dotenv from "dotenv";

dotenv.config();

const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);

export default neynarClient;
