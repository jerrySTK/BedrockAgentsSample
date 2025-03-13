/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Handler } from 'aws-lambda';
import { LambdaInput } from './models/LambdaAgentInput';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from './models/ApiResponse';
import GmailApiSender from './utils/GmailApiSender';

const token = process.env.DENUE_TOKEN || "";

export const handler: Handler = async (event: LambdaInput) => {
  

  console.log(event);
  console.log("Token",token);

  if (event.actionGroup === 'MexicoCompaniesCensus' && event.apiPath.includes('/consulta/BuscarEntidad/')) {
      try {
        let criteria = '',entidad='',limit = '',email='';
        event.parameters.forEach(p => {
          if (p.name === 'condicion') {
            criteria = p.value
          } else if (p.name === 'entidad') {
            entidad = p.value
          } else if (p.name === 'registros') {
            limit = p.value
          } else if (p.name === 'email') {
            email = p.value
          }
        });

        let response = {result: "Email was sent"}
        const data = await fetchCompaniesByCriteria(criteria, entidad, limit);
        
        if (data.length) 
          await sendEmail(email, data);
        else 
          response = {result: "No info found"}
        
        return {
          messageVersion: "1.0",
          response: {
              actionGroup: event.actionGroup,
              apiPath: event.apiPath,
              httpMethod: event.httpMethod,
              httpStatusCode: 200,
              responseBody: {
                  "application/json": {
                      body: JSON.stringify(response)
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
                body: JSON.stringify({result: "Error processing the request"})
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
    console.log("Criteria", criteria);
    console.log("EncodedCriteria", encodedCriteria);
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

async function sendEmail(to:string,jsonData: any[]) {
  // Get credentials from environment variables
  const credentials = {
    clientId: process.env.GMAIL_CLIENT_ID || '',
    clientSecret: process.env.GMAIL_CLIENT_SECRET || '',
    redirectUri: 'http://localhost:5173',
    refreshToken: process.env.GMAIL_REFRESH_TOKEN || ''
  };
  
  if (!credentials.clientId || !credentials.clientSecret || !credentials.refreshToken) {
    console.error('Gmail API credentials not provided. Please set the environment variables.');
    process.exit(1);
  }
  
  const emailSender = new GmailApiSender(credentials, 'gerardo.esau@gmail.com');
  
  // Sample JSON data

  try {
    // Send email with Excel data
    await emailSender.sendEmailWithExcelFromJson(
      to,
      'Report',
      'Report data',
      jsonData,
      'companies.xlsx',
      'data'
    );
    
    console.log('Email with Excel attachment sent successfully!');
  } catch (error) {
    console.error('Failed to send email with Excel attachment:', error);
  }
}



