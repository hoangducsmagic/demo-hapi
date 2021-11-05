import pkg from '../../package.json';
import {
  Request as HapiRequest,
  ResponseToolkit,
  Server,
  Plugin
} from '@hapi/hapi';
import Boom from '@hapi/boom';
import Hoek from '@hapi/hoek';
import { HttpHeaders, AuthMode } from '../common/constant';

interface IValidateResult {
  isValid: boolean;
  credentials: any;
}

const validateKey = async (request: HapiRequest): Promise<IValidateResult> => {
  const apiKey = request.headers[HttpHeaders.X_API_KEY];
  return process.env.API_KEY !== apiKey
    ? { isValid: false, credentials: null }
    : { isValid: true, credentials: apiKey };
};

const register = (server: Server) => {
  server.auth.scheme(AuthMode.API_KEY, (_server: Server, options) => {
    // @ts-ignore better approach?
    Hoek.assert(options, 'options are required for x-api-key'); // pre-auth checks
    return {
      authenticate: async (request: HapiRequest, h: ResponseToolkit) => {
        const apiKey = request.headers[HttpHeaders.X_API_KEY];
        if (!apiKey) {
          return h.unauthenticated(
            Object.assign(
              Boom.unauthorized('missing x-api-key', AuthMode.API_KEY),
              { isMissing: true } // to continue auth next;
            )
          );
        }
        const { isValid, credentials } = await validateKey(request);
        return isValid
          ? h.authenticated({ credentials })
          : h.unauthenticated(Boom.unauthorized('x-api-key is invalid'));
      }
    };
  });
  server.auth.strategy(AuthMode.API_KEY, AuthMode.API_KEY);
};

export const AuthApiKey: Plugin<{}> = {
  name: 'Authentication Api Key',
  version: '1.0.0',
  register,
  once: true,
  requirements: {
    hapi: '>=17.1.0'
  },
  pkg
};
export default AuthApiKey;
