import consumer from '../consumer';
import { GROUP_ID_IS_REQUIRED, CALLBACK_IS_NOT_A_FUNCTION } from '../constants';
import { EachBatchPayload, EachMessagePayload } from 'kafkajs';
import logger from '../../../logger';

jest.mock('../../../logger', () => ({
  error: () => {},
  debug: () => {}
}));

jest.mock('../kafkaInstance', () => () => ({
  consumer: () => ({
    connect: () => {},
    subscribe: () => {},
    run: () => {},
    on: () => {},
    events: {
      CRASH: 'CRASH',
      DISCONNECT: 'DISCONNECT',
      CONNECT: 'CONNECT',
      REQUEST_TIMEOUT: 'REQUEST_TIMEOUT'
    }
  })
}));

describe('consumer', () => {
  beforeEach(() => {});
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    expect.hasAssertions();
  });
  describe('init', () => {
    it('should return consumer instance', async () => {
      const kconsumer = await consumer.init({ groupId: 'cacher' });
      expect(kconsumer).toBeDefined();
    });

    it('should throw error if service name is undefined', async () => {
      try {
        // @ts-ignore
        await consumer.init();
      } catch (error) {
        expect(error).toEqual(new Error(GROUP_ID_IS_REQUIRED));
      }
    });
  });

  describe('connectSubscribeRun', () => {
    it('should run consumer without any error', async () => {
      const kconsumer = await consumer.init({ groupId: 'cacher' });

      const spyRun = jest.fn(() => Promise.resolve());
      const spySubscribe = jest.fn(() => {});
      const spyPromiseAll = jest.fn(() => []);
      // @ts-ignore
      Promise.all = spyPromiseAll;
      kconsumer.run = spyRun;
      // @ts-ignore
      kconsumer.subscribe = spySubscribe;
      const spyFunc = jest.fn(() => Promise.resolve());
      const topicsMap = {
        topic: spyFunc
      };
      await consumer.connectSubscribeRun(kconsumer, topicsMap);
      expect(spyPromiseAll).toBeCalled();
      expect(spySubscribe).toBeCalled();
      expect(spyRun).toBeCalled();
    });
  });

  describe('handleBatch', () => {
    it('should run consumer without any error', async () => {
      const spyCallBack = jest.fn(() => Promise.resolve());
      const spyResolvedOffset = jest.fn();

      const result = await consumer.handleBatch({
        topic: spyCallBack
      });
      const batchObject: Partial<EachBatchPayload> = {
        // @ts-ignore
        isRunning: () => true,
        isStale: () => false,
        resolveOffset: spyResolvedOffset,
        heartbeat: jest.fn().mockResolvedValueOnce({}),
        // @ts-ignore
        batch: {
          topic: 'topic',
          messages: [
            {
              headers: {
                'header-1': Buffer.from('header-1'),
                'header-2': Buffer.from('header-2')
              },
              key: Buffer.from('key'),
              value: Buffer.from(JSON.stringify({ foo: 'bar' })),
              timestamp: '1992-12-12',
              size: 10,
              attributes: 12,
              offset: '1'
            }
          ]
        }
      };
      const expectedMessage = {
        headers: {
          'header-1': 'header-1',
          'header-2': 'header-2'
        },
        key: 'key',
        value: { foo: 'bar' }
      };
      expect(await result(batchObject as EachBatchPayload)).toBeUndefined();
      expect(spyResolvedOffset).toHaveBeenCalledWith('1');
      expect(spyCallBack).toBeCalledWith({
        message: expectedMessage,
        partition: undefined,
        topicName: 'topic'
      });
    });

    it('should throw error if passed topic callback is not a function', async () => {
      const result = await consumer.handleBatch({
        // @ts-ignore
        topic: 'NOT_A_FUNCTION'
      });
      const batchObject: Partial<EachBatchPayload> = {
        // @ts-ignore
        isRunning: () => true,
        isStale: () => false,
        resolveOffset: () => {},
        // @ts-ignore
        batch: {
          topic: 'topic',
          messages: [
            {
              key: Buffer.alloc(10),
              value: Buffer.from(JSON.stringify(10)),
              timestamp: '1992-12-12',
              size: 10,
              attributes: 12,
              offset: '1'
            }
          ]
        }
      };
      try {
        await result(batchObject as EachBatchPayload);
      } catch (error) {
        expect(error.message).toEqual(CALLBACK_IS_NOT_A_FUNCTION);
      }
    });

    it('should throw error if callback function throws error', async () => {
      const result = await consumer.handleBatch({
        // @ts-ignore
        topic: () => Promise.reject()
      });
      const messageOffset = '23';
      const batchObject: Partial<EachBatchPayload> = {
        // @ts-ignore
        isRunning: () => true,
        isStale: () => false,
        resolveOffset: () => {},
        heartbeat: jest.fn().mockResolvedValueOnce({}),
        // @ts-ignore
        batch: {
          topic: 'topic',
          messages: [
            {
              key: Buffer.alloc(10),
              value: Buffer.from(JSON.stringify(10)),
              timestamp: '1992-12-12',
              size: 10,
              attributes: 12,
              offset: messageOffset
            }
          ]
        }
      };
      const spyLog = jest.spyOn(logger, 'error');
      await result(batchObject as EachBatchPayload);
      expect(spyLog).toBeCalled();
    });

    it('should break and ingore the entire batch of messages are stale', async () => {
      const spyCallBack = jest.fn(() => Promise.resolve());

      const result = await consumer.handleBatch({
        topic: spyCallBack
      });
      const batchObject: Partial<EachBatchPayload> = {
        // @ts-ignore
        isRunning: () => true,
        isStale: () => true,
        resolveOffset: () => {},
        heartbeat: jest.fn().mockResolvedValueOnce({}),
        // @ts-ignore
        batch: {
          topic: 'topic',
          messages: [
            {
              key: Buffer.from('key'),
              value: Buffer.from('value'),
              timestamp: '1992-12-12',
              size: 10,
              attributes: 12,
              offset: '1'
            }
          ]
        }
      };
      expect(await result(batchObject as EachBatchPayload)).toBeUndefined();
      expect(spyCallBack).not.toBeCalled();
    });

    it('should break and ingore the entire batch if isRunning callback is stale', async () => {
      const spyCallBack = jest.fn(() => Promise.resolve());

      const result = await consumer.handleBatch({
        topic: spyCallBack
      });
      const batchObject: Partial<EachBatchPayload> = {
        // @ts-ignore
        isRunning: () => false,
        isStale: () => false,
        resolveOffset: () => {},
        // @ts-ignore
        batch: {
          topic: 'topic',
          messages: [
            {
              key: Buffer.from('key'),
              value: Buffer.from('value'),
              timestamp: '1992-12-12',
              size: 10,
              attributes: 12,
              offset: '1'
            }
          ]
        }
      };
      expect(await result(batchObject as EachBatchPayload)).toBeUndefined();
      expect(spyCallBack).not.toBeCalled();
    });
  });

  describe('handleMessage', () => {
    it('should run consumer without any error', async () => {
      const spyCallBack = jest.fn(() => Promise.resolve());

      const result = await consumer.handleMessage({
        topic: spyCallBack
      });
      const messageObject: Partial<EachMessagePayload> = {
        topic: 'topic',
        message: {
          headers: {
            'header-1': Buffer.from('header-1'),
            'header-2': Buffer.from('header-2')
          },
          key: Buffer.from('key'),
          value: Buffer.from(JSON.stringify({ foo: 'bar' })),
          timestamp: '1992-12-12',
          size: 10,
          attributes: 12,
          offset: '1'
        }
      };
      const expectedMessage = {
        headers: {
          'header-1': 'header-1',
          'header-2': 'header-2'
        },
        key: 'key',
        value: { foo: 'bar' }
      };
      expect(await result(messageObject as EachMessagePayload)).toBeUndefined();
      expect(spyCallBack).toBeCalledWith({
        message: expectedMessage,
        partition: undefined,
        topicName: 'topic'
      });
    });
  });
});
