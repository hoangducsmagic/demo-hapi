import deliveryController from './sampleResource/sampleResource.controller';
import pingController from './ping/ping.controller';

const routes = [...pingController, ...deliveryController];

export { routes };
