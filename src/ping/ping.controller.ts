import { ServerRoute } from '@hapi/hapi';
import config from '../config';

const ping: ServerRoute = {
  method: 'GET',
  path: `/${config.servicePath}/ping`,
  options: {
    auth: false,
    description: 'Pongs back',
    notes: 'To check is service pongs on a ping',
    tags: ['api'],
    handler: async () => {
      return 'pong';
    }
  }
};
const healthController: ServerRoute[] = [ping];
export default healthController;
