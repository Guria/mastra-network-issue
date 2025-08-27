import { NewAgentNetwork } from "@mastra/core/network/vNext";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

import { weatherWorkflow } from "../workflows/weather-workflow";
import { weatherAgent } from "../agents/weather-agent";
import { bedrock } from "@ai-sdk/amazon-bedrock";

const memory = new Memory({
  storage: new LibSQLStore({
    url: "file:../mastra.db",
  }),
});

export const weatherNetwork = new NewAgentNetwork({
  id: "weather-network",
  name: "Weather Network",
  instructions: `
You are a routing controller for weather tasks. You have two primitives available:

1) weatherWorkflow — Use this for multi-step requests that require:
   - Planning activities based on a forecast for a given city
   - Fetching a forecast and then producing a structured activity plan
   - Any request mentioning "plan", "itinerary", or "suggest activities"

2) Weather Agent — Use this for:
   - Current conditions for a location (temperature, wind, humidity, etc.)
   - Conversational Q&A about weather details
   - Short, direct answers without multi-step planning

Routing rules:
- If the user asks to "plan activities", "give an itinerary", or "based on the forecast", prefer weatherWorkflow.
- If the user asks "what's the weather right now in <city>?" or any quick weather fact, prefer Weather Agent.
- When unsure, choose the most specific primitive that matches the user's intent.
- Keep the inputs clean and extract the city name when needed.
`,
  model: bedrock("anthropic.claude-3-5-sonnet-20240620-v1:0"),
  agents: {
    weatherAgent,
  },
  workflows: {
    weatherWorkflow,
  },
  memory,
});
