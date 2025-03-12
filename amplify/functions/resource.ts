import { defineFunction } from "@aws-amplify/backend";

export const toolsAgentHandler = defineFunction({
    name: "ToolsAgentHandler",
    entry: "./ToolsAgentHandler.ts",
});