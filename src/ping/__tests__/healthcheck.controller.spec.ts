import { Server } from '@hapi/hapi';
import healthController from '../ping.controller';
import config from '../../config';

describe('ping controller', () => {
  let server: Server;
  beforeAll(async () => {
    server = new Server();
    server.route(healthController);
  });

  it('should responds with success for ping', async () => {
    const options = {
      method: 'GET',
      url: `/${config.servicePath}/ping`
    };

    const response = await server.inject(options);
    expect(response.statusCode).toEqual(200);
  });
});
