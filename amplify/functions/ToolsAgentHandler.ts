/* eslint-disable @typescript-eslint/no-unused-vars */
import { Handler } from 'aws-lambda';
import { LambdaInput } from './models/LambdaAgentInput';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from './models/ApiResponse';

const token = process.env.DENUE_TOKEN || "";

export const handler: Handler = async (event: LambdaInput) => {
  

  console.log(event);
  console.log("Token",token);

  if (event.actionGroup === 'MexicoCompaniesCensus' && event.apiPath.includes('/consulta/BuscarEntidad/')) {
      try {
        let criteria = '',entidad='',limit = '';
        event.parameters.forEach(p => {
          if (p.name === 'condicion') {
            criteria = p.value
          } else if (p.name === 'entidad') {
            entidad = p.value
          } else if (p.name === 'registros') {
            limit = p.value
          }
        });

        const data = await fetchCompaniesByCriteria(criteria, entidad, limit);
        return {
          messageVersion: "1.0",
          response: {
              actionGroup: event.actionGroup,
              apiPath: event.apiPath,
              httpMethod: event.httpMethod,
              httpStatusCode: 200,
              responseBody: {
                  "application/json": {
                      body: JSON.stringify(data)
                  }
              }
          },
          sessionAttributes: event.sessionAttributes,
          promptSessionAttributes: event.promptSessionAttributes
        };
        
        

      } catch (error) {
        console.error('Error fetching companies:', error);
      }
  } 

  return {
    messageVersion: "1.0",
    response: {
        actionGroup: event.actionGroup,
        apiPath: event.apiPath,
        httpMethod: event.httpMethod,
        httpStatusCode: 200,
        responseBody: {
            "application/json": {
                body: JSON.stringify({data: 'no results'})
            }
        }
    },
    sessionAttributes: event.sessionAttributes,
    promptSessionAttributes: event.promptSessionAttributes
  };
}


async function fetchCompaniesByCriteria(criteria:string,entidad:string,limit:string): Promise<ApiResponse[]> {
  try {
    const encodedCriteria = encodeURIComponent(criteria);
    console.log("Querying",`https://www.inegi.org.mx/app/api/denue/v1/consulta/BuscarEntidad/${encodedCriteria}/${entidad}/1/${limit}/${token}`);
    const response: AxiosResponse<ApiResponse[]> = await axios.get<ApiResponse[]>(`https://www.inegi.org.mx/app/api/denue/v1/consulta/BuscarEntidad/${encodedCriteria}/${entidad}/1/${limit}/${token}`);
    
    const data: ApiResponse[] = response.data;
    
    return data;
  } catch (error) {
    
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
    
      console.error('Error status:', axiosError.response.status);
      console.error('Error data:', axiosError.response.data);
    } else if (axiosError.request) {
    
      console.error('No response received:', axiosError.request);
    } else {
    
      console.error('Error message:', axiosError.message);
    }
    throw error;
  }
}