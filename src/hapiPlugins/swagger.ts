import * as HapiSwagger from 'hapi-swagger';
import * as Package from '../../package.json';
import config from '../config';

const serviceName = config.serviceName;
const servicePath = config.servicePath;

const swaggerOptions: HapiSwagger.RegisterOptions = {
  info: {
    title: serviceName,
    version: Package.version
  },
  securityDefinitions: {
    // jwt: {
    //   type: 'apiKey',
    //   name: 'Authorization',
    //   in: 'header'
    // },
    apiKey: {
      type: 'apiKey',
      name: 'x-api-key',
      in: 'header'
    }
  },
  security: [{ jwt: [], apiKey: [] }],
  jsonPath: `/${servicePath}/swagger.json`,
  documentationPath: `/${servicePath}/documentation`,
  swaggerUIPath: `/${servicePath}/swaggerui/`
};

export default {
  plugin: HapiSwagger,
  options: swaggerOptions
};
