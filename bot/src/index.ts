// src/index.ts
import bot from "./bot";
import { PORT } from "./config";

bot.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
