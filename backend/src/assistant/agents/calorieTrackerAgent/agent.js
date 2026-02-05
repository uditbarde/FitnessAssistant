import {
  END,
  MessagesValue,
  START,
  StateGraph,
  StateSchema,
} from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AIMessage, createAgent, HumanMessage, SystemMessage } from "langchain";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { model } from "../../../service/openai.js";
import { calorieCounterTool } from "./tools/calculate_calories.js";
import * as z from "zod";
const agentState = new StateSchema({
  messages: MessagesValue,
  chat_history: z.array(MessagesValue),
});
const responseFormat = z.object({});
const tools = new ToolNode([calorieCounterTool]);
const prompt = new SystemMessage({
  content: `You are a helpful agent for tracking calories
    You have access to the following tools : ${calorieCounterTool.name} ${calorieCounterTool.description}
    Always return the output as a valid json.
    If you are sure that you have the final answer respond with {{action:}}
  `,
});
const agent = createAgent({
  model: model,
  tools: [calorieCounterTool],
  systemPrompt: prompt,
});

const call_agent = async (state) => {
  let last_mesasge = state.messages.at(-1);
  const input = {
    last_mesasge,
    prompt,
  };
  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content: last_mesasge.content,
      },
    ],
  });
  console.log(result);
  const last = result.messages.at(-1);

  state.messages.push(
    last instanceof AIMessage ? last : new AIMessage({ content: last.content }),
  );
  return { ...state };
};
const shouldContinue = function (state) {
  const last_message = state.messages.at(-1);
  if (last_message?.tool_calls?.length) {
    return "tools";
  }
  return "__end__";
};
export const calorieTrackerAgent = new StateGraph(agentState)
  .addNode("agent", call_agent)
  .addNode("tools", tools)
  .addEdge(START, "agent")
  .addConditionalEdges("agent", shouldContinue, ["tools", END])
  .addEdge("tools", "agent")
  .compile();
