import { ChatOpenAI } from "@langchain/openai";
process.loadEnvFile()
export const model = new ChatOpenAI({
    apiKey:process.env.OPENAI_API_KEY,
    model:"gpt-4.1-mini",
    maxCompletionTokens:2000,
    temperature:0.5,
})
