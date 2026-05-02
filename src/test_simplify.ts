import fs from "fs/promises";

async function main() {
  const data = await fs.readFile("tools.json", "utf8");
  const tools = JSON.parse(data);
  const simplified = tools.map((t: any) => ({
    name: t.name,
    toolkit: t.toolkit,
    desc: t.description,
    in: t.inputParameters?.properties ? Object.keys(t.inputParameters.properties) : [],
    out: t.outputParameters?.properties ? Object.keys(t.outputParameters.properties) : [],
  }));
  
  await fs.writeFile("simplified_tools.json", JSON.stringify(simplified, null, 2));
  console.log(`Simplified tools: ${simplified.length}`);
}

main().catch(console.error);
