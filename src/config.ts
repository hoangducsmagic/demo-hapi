import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { merge } from 'lodash';
import logger from './logger';

dotenv.config();
const env = process.env.NODE_ENV;
const configDir = `${__dirname}/configs`;
logger.info(`Loading config from ${configDir} for ${env}`);

export const loadJsonConfigs = (): any => {
  let jsonConfig = {};
  if (env && existsSync(`${configDir}/${env}.json`)) {
    jsonConfig = require(`${configDir}/${env}.json`);
  }

  if (existsSync(`${configDir}/default.json`)) {
    jsonConfig = merge(require(`${configDir}/default.json`), jsonConfig);
  }
  return jsonConfig;
};

export const loadConfigs = (): any => {
  const jsonConfigs = loadJsonConfigs();
  return merge(jsonConfigs, {
    serviceName: process.env.SERVICE_NAME || jsonConfigs.serviceName,
    servicePath: process.env.SERVICE_NAME || jsonConfigs.servicePath,
    server: {
      host: process.env.SERVER_HOST || '0.0.0.0',
      port: process.env.SERVER_PORT || 8005
    },
    mongoDb: {
      uri: process.env.MONGO_URI,
      poolSize: Number(process.env.MONGO_POOLSIZE || 5)
    },
    kafka: {
      brokers: process.env.KAFKA_BROKERS
        ? process.env.KAFKA_BROKERS.split(',')
        : [],
      partitionsConsumedConcurrently:
        process.env.PARTITIONS_CONSUMED_CONCURRENTLY || undefined
    },
    redis: {
      uri: process.env.REDIS_URI
    }
  });
};

export default loadConfigs();
