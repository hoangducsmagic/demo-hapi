import { Server, ServerInjectResponse } from '@hapi/hapi';
import { HttpHeaders } from '../../common/constant';
import AuthApiKey from '../authApiKey';
import { AuthMode } from '../../common/constant';
import http from '../../common/http';

describe('Plugin - authentication', () => {
  const PATH_URL_NOT_REQUIRE = '/test';
  const PATH_URL_JUST_REQUIRE_API_KEY = '/test/api-key';
  const testServer = new Server();

  testServer.register([AuthApiKey]).then(() => {
    testServer.auth.default({
      strategies: [AuthMode.API_KEY]
    });
    testServer.route([
      {
        method: http.Method.GET,
        path: PATH_URL_NOT_REQUIRE,
        options: {
          auth: false,
          handler: () => 'test not require nothing'
        }
      },
      {
        method: http.Method.GET,
        path: PATH_URL_JUST_REQUIRE_API_KEY,
        options: {
          auth: {
            strategy: AuthMode.API_KEY
          },
          handler: () => 'test Api key'
        }
      }
    ]);
  });

  beforeEach(() => {
    process.env.API_KEY = '123456789';
    jest.resetAllMocks();
  });

  describe('handle validation token', () => {
    it('should response data when miss token on path url not require', async () => {
      const response: ServerInjectResponse = await testServer.inject({
        method: http.Method.GET,
        url: PATH_URL_NOT_REQUIRE
      });
      expect(response.statusCode).toBe(200);
      expect(response.result).toEqual('test not require nothing');
    });

    it('should throw 401 with route just require api-key but header empty', async () => {
      const response: ServerInjectResponse = await testServer.inject({
        url: PATH_URL_JUST_REQUIRE_API_KEY
      });
      expect(response.statusCode).toBe(401);
      expect(response.result).toEqual({
        error: 'Unauthorized',
        message: 'Missing authentication',
        statusCode: http.StatusCode.UNAUTHORIZED
      });
    });

    it('should throw 401 with route just require api-key but header api key invalid', async () => {
      const response: ServerInjectResponse = await testServer.inject({
        url: PATH_URL_JUST_REQUIRE_API_KEY,
        headers: {
          [HttpHeaders.X_API_KEY]: '123456'
        }
      });
      expect(response.statusCode).toBe(401);
      expect(response.result).toEqual({
        error: 'Unauthorized',
        message: 'x-api-key is invalid',
        statusCode: http.StatusCode.UNAUTHORIZED
      });
    });

    it('should response 200 & data with route just require api-key', async () => {
      const response: ServerInjectResponse = await testServer.inject({
        url: PATH_URL_JUST_REQUIRE_API_KEY,
        headers: {
          [HttpHeaders.X_API_KEY]: '123456789'
        }
      });
      expect(response.statusCode).toBe(200);
      expect(response.result).toEqual('test Api key');
    });
  });
});
