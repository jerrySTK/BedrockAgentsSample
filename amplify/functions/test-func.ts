/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { handler } from "./ToolsAgentHandler";

const lambda = handler;

const event = {
    messageVersion: '1.0',
    parameters: [
      { name: 'entidad', type: 'string', value: '08' },
      { name: 'condicion', type: 'string', value: 'residuos' },
      { name: 'registros', type: 'string', value: '100' },
      { name: 'email', type: 'string', value: 'gromero@sitek.mx' }
    ],
    inputText: 'me puedes dar los negocios de residuos de chihuahua , dame un top 100',
    sessionId: '530602321449870',
    agent: {
      name: 'denue-agent',
      version: 'DRAFT',
      id: 'NH5IKS84IE',
      alias: 'TSTALIASID'
    },
    actionGroup: 'MexicoCompaniesCensus',
    httpMethod: 'GET',
    apiPath: '/consulta/BuscarEntidad/{condicion}/{entidad}/1/{registros}',
    sessionAttributes: {},
    promptSessionAttributes: {}
  }

async function main()  {
    await lambda(event,{
        callbackWaitsForEmptyEventLoop: false,
        functionName: "",
        functionVersion: "",
        invokedFunctionArn: "",
        memoryLimitInMB: "",
        awsRequestId: "",
        logGroupName: "",
        logStreamName: "",
        getRemainingTimeInMillis: function (): number {
            throw new Error("Function not implemented.");
        },
        done: function (error?: Error, result?: any): void {
            throw new Error("Function not implemented.");
        },
        fail: function (error: Error | string): void {
            throw new Error("Function not implemented.");
        },
        succeed: function (messageOrObject: any): void {
            throw new Error("Function not implemented.");
        }
    },()=> {});
}

main().catch(error => {
    console.error('Unhandled error in main:', error);
    process.exit(1);
  });

