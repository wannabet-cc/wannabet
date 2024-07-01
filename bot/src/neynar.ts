import { NeynarAPIClient, isApiErrorResponse } from "@neynar/nodejs-sdk";
import { NEYNAR_API_KEY, SIGNER_UUID, WANNA_BET_CHANNEL_ID } from "./config";

const neynarClient = new NeynarAPIClient(NEYNAR_API_KEY);

const publishCast = async (
  message: string,
  options?: {
    replyToCastHash?: string;
    frameUrl?: string;
  }
) => {
  try {
    // -> use neynarClient to publish the cast
    const neynarOptions = {
      replyTo: options?.replyToCastHash,
      channelId: WANNA_BET_CHANNEL_ID,
      embeds: options?.frameUrl ? [{ url: options.frameUrl }] : undefined,
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

export { neynarClient, publishCast };
