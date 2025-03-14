import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { fetchAuthSession } from "aws-amplify/auth";

class BedrockAgentService {
    private client?: BedrockAgentRuntimeClient;
    private agentId: string;
    private region: string;
    private agentAliasId: string;

    constructor(region: string, agentId: string, agentAliasId: string) {
        this.region = region;
        this.agentId = agentId;
        this.agentAliasId = agentAliasId;
    }

    private async getAuthenticatedClient() {
        const auth = await fetchAuthSession({ forceRefresh: true });
        const credentials = auth.credentials;

        if (!credentials) {
            throw new Error("No credentials found");
        }

        if (!this.client)
            this.client = new BedrockAgentRuntimeClient({
                region: this.region,
                credentials: {
                    accessKeyId: credentials.accessKeyId || '',
                    secretAccessKey: credentials?.secretAccessKey,
                    sessionToken: credentials?.sessionToken,
                },
            });
        return this.client;
    }

    public async sendMessage(userMessage: string, sessionId: string) {
        try {
            const bedrockClient = await this.getAuthenticatedClient();

            const response = await bedrockClient.send(
                new InvokeAgentCommand({
                    agentId: this.agentId,
                    sessionId: sessionId, // Ensure unique session tracking
                    inputText: userMessage,
                    agentAliasId: this.agentAliasId
                })
            );

            if (response.completion) {
                let completion = "";
                for await (const chunkEvent of response.completion) {
                    const chunk = chunkEvent.chunk;
                    console.log(chunk);
                    if (chunk) {
                        const decodedResponse = new TextDecoder("utf-8").decode(chunk.bytes);
                        completion += decodedResponse;
                    }
                }
                return completion;
            }
            else
                return "Error communicating with AI agent.";
        } catch (error) {
            console.error("BedrockAgentService Error:", error);
            return "Error communicating with AI agent.";
        }
    }
}

export default BedrockAgentService;
