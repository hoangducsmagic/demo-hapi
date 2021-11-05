import { Server } from '@hapi/hapi';
import * as Inert from '@hapi/inert';
import * as Vision from '@hapi/vision';
import { getNamespace } from 'cls-hooked';
import { AuthMode, Tracing } from './common/constant';
import errorHandler from './common/handleValidationErrors';
// import kafkaConsumer from './common/kafkaConsumer';
// import kafkaProducer from './common/kafkaProducer';
import config from './config';
import logger from './logger';
import AuthApiKey from './hapiPlugins/authApiKey';
import Pino from './hapiPlugins/pino';
import RequestWrapper from './hapiPlugins/requestWrapper';
import ResponseWrapper from './hapiPlugins/responseWrapper';
import Swagger from './hapiPlugins/swagger';
import { routes } from './routes';
import { connectMongo } from './common/mongoDb';
import { EnableSwaggerEnvs } from './common/constant';
import { saveTracking } from './tracking/tracking.service';

const createServer = async () => {
  const server = new Server({
    port: config.server.port,
    host: config.server.host,
    routes: {
      validate: {
        options: {
          abortEarly: false
        },
        failAction: errorHandler
      }
    }
  });

  // Always register plugins before register routes
  const plugins: any[] = [
    Inert,
    Vision,
    AuthApiKey,
    Pino,
    ResponseWrapper,
    RequestWrapper
  ];
  if (EnableSwaggerEnvs.includes(process.env.NODE_ENV as any)) {
    plugins.push(Swagger);
  }
  await server.register(plugins);

  // Setup default mode Auth for server all routes
  // This will check by order with OR statement
  server.auth.default({
    strategies: [AuthMode.API_KEY]
  });

  // Register routes
  server.route(routes);

  server.events.on('response', request => {
    const session = getNamespace(Tracing.TRACER_SESSION);
    // @ts-ignore suggest any better approach?
    const clsCtx = request.app[Tracing.TRACER_SESSION].context;
    saveTracking(request);
    // @ts-ignore
    session.exit(clsCtx);
  });

  return server;
};

export const init = async () => {
  await connectMongo();
  const server = await createServer();
  await server
    .initialize()
    .then(() =>
      logger.info(
        `______      SERVER LISTENING AT   ${server.info.host}:${server.info.port}      ______`
      )
    );
  return server;
};

export const start = async (module: NodeModule) => {
  if (!module.parent) {
    await init()
      .then(async server => {
        // await kafkaConsumer.connect();
        // await kafkaProducer.connect();
        await server.start();
        // start queues should be at last
      })
      .catch(err => {
        logger.error('Server cannot start', err.stack);
        logger.onFinished(() => {
          process.exit(1);
        });
      });
  }
};

logger.info(
  `Server is starting in ${__dirname} executed in ${process.env.PWD}`
);
start(module);
