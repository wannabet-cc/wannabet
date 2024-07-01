import { createSchema } from "@ponder/core";

export default createSchema((p) => ({
  Bet: p.createTable({
    id: p.bigint(),
    chainId: p.int(),
    contractAddress: p.hex(),
    creator: p.hex(),
    participant: p.hex(),
    amount: p.bigint(),
    token: p.hex(),
    message: p.string(),
    judge: p.hex(),
    validUntil: p.bigint(),
    createdTime: p.bigint(),
  }),
}));
