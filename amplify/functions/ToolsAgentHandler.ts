/* eslint-disable @typescript-eslint/no-unused-vars */
import { Handler } from 'aws-lambda';
import { LambdaInput } from './models/LambdaAgentInput';

export const handler: Handler = async (event: LambdaInput) => {
  // your function code goes here
  console.log(event);
  return;
}