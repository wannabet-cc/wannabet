import dotenv from "dotenv";
dotenv.config();

// Sensitive info
const ALCHEMY_TOKEN = process.env.ALCHEMY_TOKEN!;
const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY!;
const FARCASTER_BOT_MNEMONIC = process.env.FARCASTER_BOT_MNEMONIC!;
const SIGNER_UUID = process.env.SIGNER_UUID!;

// Farcaster constants
const WANNA_BET_CHANNEL_ID = "https://warpcast.com/~/channel/wannabet";

// Smart contract constants
const BET_CREATED_EVENT_SIGNATURE =
  "0xeb61722110fd856b0d96d3312d86d62fcda6eee1eee2366d2c10e1d564d120e8";
const BET_ACCEPTED_EVENT_SIGNATURE =
  "0xdd6dae32994530eefb2d3b21473a19ec9f41d294a4fd6353b9b16d2d2c674b96";
const BET_DECLINED_EVENT_SIGNATURE =
  "0x815a1274b6d601b9c13c3a4ca7a73f7f180c6808c6b73b68360880ab923d979a";
const BET_SETTLED_EVENT_SIGNATURE =
  "0x1263c5e68e09cb9dfb7e7df0f53d955963a974e73d6ef177fadeb882cd9629ab";

// Urls & other
const FRAME_BASE_URL = ""; // frame is not deployed yet

export {
  ALCHEMY_TOKEN,
  NEYNAR_API_KEY,
  FARCASTER_BOT_MNEMONIC,
  SIGNER_UUID,
  WANNA_BET_CHANNEL_ID,
  BET_CREATED_EVENT_SIGNATURE,
  BET_ACCEPTED_EVENT_SIGNATURE,
  BET_DECLINED_EVENT_SIGNATURE,
  BET_SETTLED_EVENT_SIGNATURE,
  FRAME_BASE_URL,
};
