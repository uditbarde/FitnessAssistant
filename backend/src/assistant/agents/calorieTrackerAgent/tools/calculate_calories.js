import { DynamicStructuredTool } from "@langchain/core/tools";
import {z} from "zod"
const toolSchema = z.object({
    food:z.string(),
    quantity:z.string().default("1 Serving")
})

async function calorieFinder(food, quantity="1 Serving"){
 return "250"
}
export const calorieCounterTool = new DynamicStructuredTool({
    name:"calorie_counter",
    description:"A tool to fetch calories of a given food item.",
    schema:toolSchema,
    func: calorieFinder
},"calorie_counter")