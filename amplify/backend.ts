import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { toolsAgentHandler } from './functions/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
defineBackend({
  auth,
  toolsAgentHandler
});
