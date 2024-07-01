import { ponder } from "@/generated";
import { BetAbi } from "../abis/BetAbi";

ponder.on("BetFactoryBase:BetCreated", async ({ event, context }) => {
  console.log("Indexing event: BetFactory:BetCreated");
  try {
    // read contract data
    const [
      betId,
      creator,
      participant,
      amount,
      token,
      message,
      judge,
      validUntil,
    ] = await context.client.readContract({
      address: event.args.contractAddress,
      abi: BetAbi,
      functionName: "betDetails",
    });
    // create record
    const { Bet } = context.db;
    await Bet.create({
      id: betId,
      data: {
        chainId: 8453,
        contractAddress: event.args.contractAddress,
        creator,
        participant,
        amount,
        token,
        message,
        judge,
        validUntil,
        createdTime: event.block.timestamp,
      },
    });
  } catch (error) {
    const errorMsg = "Failed to create bet record";
    console.error(errorMsg, error);
    throw new Error(errorMsg);
  }
});
