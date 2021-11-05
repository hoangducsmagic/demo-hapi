import { connect, connection, set } from 'mongoose';
import logger from '../logger';
import config from '../config';

export const connectMongo = () =>
  new Promise<void>((resolve, reject) => {
    const mongoUri = config.mongoDb.uri;
    const connectionOptions = {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      poolSize: config.mongoDb.poolSize
    };

    if (!mongoUri) {
      throw new Error('Mongo URI is require to connect Db');
    }
    connection.on('error', (err: any) => {
      logger.error('error while connecting to mongodb', err);
    });

    connection.once('error', reject); // reject first error

    connection.once('open', () => {
      connection.off('error', reject);
      resolve();
    });

    connection.on('reconnected', () => {
      logger.info('Connection to mongodb is resumed');
    });

    connection.on('disconnected', () => {
      logger.error('Mongodb disconnected');
    });

    set('useCreateIndex', true);
    connect(mongoUri, connectionOptions);
  });
