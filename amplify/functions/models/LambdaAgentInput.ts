export interface LambdaInput {
    messageVersion: string;
    agent: Agent;
    inputText: string;
    sessionId: string;
    actionGroup: string;
    apiPath: string;
    httpMethod: string;
    parameters: Parameter[];
    requestBody: RequestBody;
    sessionAttributes: Record<string,string>;
    promptSessionAttributes: Record<string,string>;

}

export interface Agent {
    name: string;
    id: string;
    alias: string;
    version: string;
}

export interface Parameter {
    name: string;
    type: string;
    value: string;
}

export interface RequestBody {
    content: Record<string,Properties[]>;
}

export interface Properties {
    name: string;
    type: string;
    value: string;
}

// {
//     "messageVersion": "1.0",
//     "agent": {
//         "name": "string",
//         "id": "string",
//         "alias": "string",
//         "version": "string"
//     },
//     "inputText": "string",
//     "sessionId": "string",
//     "actionGroup": "string",
//     "apiPath": "string",
//     "httpMethod": "string",
//     "parameters": [
//         {
//             "name": "string",
//             "type": "string",
//             "value": "string"
//         },
//     ...
//     ],
//     "requestBody": {
//         "content": {
//             "<content_type>": {
//                 "properties": [
//                    {
//                        "name": "string",
//                        "type": "string",
//                        "value": "string"
//                     },
//                             ...
//                 ]
//             }
//         }
//     },
//     "sessionAttributes": {
//         "string": "string",
//     },
//     "promptSessionAttributes": {
//         "string": "string"
//     }
// }