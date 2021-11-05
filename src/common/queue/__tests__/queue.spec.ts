import Queue from '../index';
import { QueueOptions } from 'bull';
// @ts-ignore
import ioredis from 'ioredis-mock';

describe('queue module', () => {
  let queue: Queue;
  const queueName = 'Jest-queue';
  const options: QueueOptions = {
    redis: new ioredis()
  };
  beforeEach(() => {
    queue = new Queue(queueName, options);
  });
  afterEach(async () => {
    expect.hasAssertions();
    jest.clearAllMocks();
    await queue.closeQueue();
  });
  describe('init -  queue', () => {
    it('should init queue', async () => {
      expect(queue.getBullQueue()).toBeDefined();
    });
  });
});
