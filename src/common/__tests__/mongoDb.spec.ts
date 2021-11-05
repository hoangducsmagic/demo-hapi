/* eslint-disable no-console */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { connectMongo } from '../mongoDb';
import config from '../../config';

jest.mock('../../logger', () => ({
  info: console.info,
  error: console.error
}));

describe('dbConnect', () => {
  const originDatabase = config.mongoDb;
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('connectMongo', () => {
    let mongod: MongoMemoryServer;
    const dbName = 'myDB';

    beforeEach(() => {
      mongod = new MongoMemoryServer({
        instance: {
          dbName
        }
      });
    });

    afterEach(async () => {
      config.mongoDb = originDatabase;
      await mongoose.disconnect();
      await mongod.stop();
    });

    it(`should reject if config.mongoDb.uri is not provided`, async () => {
      config.mongoDb = { ...config.mongoDb, uri: '' };
      const error = await connectMongo().catch(err => err);
      expect(error).toBeDefined();
    });

    it('should reject if on first connection fail if retry not set', async () => {
      jest.spyOn(mongoose, 'connect').mockImplementationOnce((): any => {
        mongoose.connection.emit('error', new Error());
        return new Promise(resolve => {
          resolve();
        });
      });
      const port = await mongod.getPort();
      config.mongoDb = {
        ...config.mongoDb,
        hosts: [`127.9.9.1:${port}`]
      };
      const error = await connectMongo().catch(err => err);

      expect(error).toBeDefined();
    });
  });
});
