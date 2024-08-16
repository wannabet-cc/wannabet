import { PRIVY_APP_ID, PRIVY_APP_SECRET } from "@/config/server";
import { PrivyClient } from "@privy-io/server-auth";

const privy = new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);

export default privy;
