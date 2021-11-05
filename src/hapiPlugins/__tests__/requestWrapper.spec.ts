import { Server, ServerInjectResponse } from '@hapi/hapi';
import requestWrapper from '../requestWrapper';
import responseWrapper from '../responseWrapper';
import http from '../../common/http';
import { get } from 'lodash';
import { HttpHeaders } from '../../common/constant';

jest.mock('cls-hooked', () => {
  const origin = jest.requireActual('cls-hooked');
  return {
    ...origin,
    getNamespace: jest.fn().mockReturnValue({
      context: 'context'
    })
  };
});
describe('Plugin - requestWrapper', () => {
  const testServer = new Server();
  testServer.route([
    {
      method: http.Method.GET,
      path: '/test',
      options: {
        handler: () => 'test'
      }
    }
  ]);

  testServer.register([requestWrapper, responseWrapper]);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('handleHapiRequest', () => {
    it('should continue with request made without any error', async () => {
      const response: ServerInjectResponse = await testServer.inject({
        method: http.Method.GET,
        url: '/test',
        headers: {
          [HttpHeaders.LANGUAGE]: 'vn'
        }
      });
      const headers = response.request.headers;
      expect(headers['x-language']).toEqual('vi');
      expect(headers['x-currency']).toEqual('VND');
      expect(get(response, 'result.data')).toEqual('test');
    });

    it('should continue with request have config headers', async () => {
      const response: ServerInjectResponse = await testServer.inject({
        method: http.Method.GET,
        url: '/test',
        headers: {
          [HttpHeaders.LANGUAGE]: 'en',
          [HttpHeaders.CURRENCY]: 'USD',
          referer: 'https://localhost',
          'x-forwarded-host': 'http//localhost',
          'x-forwarded-port': '8080',
          'content-type': 'application/json, application/json'
        }
      });
      const headers = response.request.headers;
      expect(headers['content-type']).toEqual('application/json');
      expect(headers['x-language']).toEqual('en');
      expect(headers['x-currency']).toEqual('USD');
      expect(headers['x-forwarded-proto']).toEqual('https');
      expect(headers['x-forwarded-host']).toEqual('http//localhost:8080');
      expect(get(response, 'result.data')).toEqual('test');
    });
  });
});
