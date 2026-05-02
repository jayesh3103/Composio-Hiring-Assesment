import { Composio } from "@composio/core";

const composio = new Composio();

// raw tools are direct tools from composio without any wrapping based on providers
// provider wrappings are needed for executing tools
const tools = await composio.tools.getRawComposioTools({
  toolkits: ["googlesuper", "github"],
  limit: 1000,
});

import { writeFile } from "fs/promises";

await writeFile(
  "tools.json",
  JSON.stringify(tools, null, 2),
  "utf-8"
);
console.log(`Tools written to tools.json (Total tools: ${tools.length})`);
