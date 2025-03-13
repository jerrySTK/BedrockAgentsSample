import { defineFunction } from "@aws-amplify/backend";

export const toolsAgentHandler = defineFunction({
    name: "ToolsAgentHandler",
    timeoutSeconds: 900,
    environment: {
        "DENUE_TOKEN" : "cc368ad6-c1a2-40b0-aa83-bb6a0125a43e"
    },
    entry: "./ToolsAgentHandler.ts",
});