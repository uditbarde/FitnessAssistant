import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { calorieTrackerAgent } from "./assistant/agents/calorieTrackerAgent/agent.js";
import { HumanMessage } from "langchain";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontend_path = path.resolve(__dirname, "../../frontend/dist");
// console.log(frontend_path);

const app = express();
const PORT = 3000;
app.use(cors());
app.use(express.json());
app.use(express.static(frontend_path));
app.get("/", (req, res) => {
  res.status(200).send({
    message: "Hello World",
  });
});
app.get("/app", (req, res) => {
  res.status(200).send();
});
app.post("/agent/execute", async (req, res) => {
  console.log("request", req.body);
  const input = {};
  const result = await calorieTrackerAgent.invoke({
    messages: [new HumanMessage({ content: req.body.query })],
  });
  // console.log(result);
  if (result) {
    res.status(200).send(result.messages.at(-1).content);
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
