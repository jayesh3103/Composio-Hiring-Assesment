import fs from "fs/promises";
import { z } from "zod";

async function callOpenRouter(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "anthropic/claude-3-haiku",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter API error: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function extractParams(paramsObj: any): string[] {
  if (!paramsObj || !paramsObj.properties) return [];
  return Object.keys(paramsObj.properties);
}

async function analyzeToolkit(tools: any[], apiKey: string) {
  const simplifiedTools = tools.map((t: any) => ({
    name: t.slug,
    description: t.description,
    inputs: extractParams(t.inputParameters),
    outputs: extractParams(t.outputParameters)
  }));

  const prompt = `You are a helpful assistant that analyzes tool dependencies for agentic workflows.
We have a set of tools. Some tools need inputs that are generated as outputs of other tools (precursor actions).
For example, a tool "REPLY_TO_THREAD" needs a "thread_id", which is produced by "LIST_THREADS".

Analyze the following tools and identify meaningful dependencies. 
Rules:
1. Look for output parameter names from a Source tool that match required input parameter names of a Target tool (e.g. "id" or "thread_id").
2. Only output dependencies where it logically makes sense (e.g. fetching an item before modifying it).
3. Do not create circular dependencies.
4. Output a JSON object containing an array called "edges". Each edge should be: {"source": "SOURCE_TOOL_SLUG", "target": "TARGET_TOOL_SLUG", "parameter": "name_of_param", "reason": "brief reason"}.

Tools:
${JSON.stringify(simplifiedTools, null, 2)}
`;

  console.log(`Sending ${simplifiedTools.length} tools to LLM...`);
  const responseContent = await callOpenRouter(prompt, apiKey);
  try {
    const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : responseContent;
    const parsed = JSON.parse(jsonStr);
    return parsed.edges || [];
  } catch (e) {
    console.error("Failed to parse JSON from LLM", responseContent);
    return [];
  }
}

async function main() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not set");

  const data = await fs.readFile("tools.json", "utf8");
  const allTools = JSON.parse(data);

  const googlesuperTools = allTools.filter((t: any) => t.toolkit.name === "googlesuper");
  const githubTools = allTools.filter((t: any) => t.toolkit.name === "github");

  console.log(`Analyzing googlesuper (${googlesuperTools.length} tools)`);
  const googlesuperEdges = await analyzeToolkit(googlesuperTools, apiKey);

  console.log(`Analyzing github (using first 100 tools for high quality graph)`);
  const githubEdges = await analyzeToolkit(githubTools.slice(0, 100), apiKey);
  
  const allEdges = [...googlesuperEdges, ...githubEdges];
  
  await fs.writeFile("dependencies.json", JSON.stringify({ edges: allEdges }, null, 2));
  console.log(`Dependencies written to dependencies.json (Total edges: ${allEdges.length})`);
}

main().catch(console.error);
