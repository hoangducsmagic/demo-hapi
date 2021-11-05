import producer from '../producer';

jest.mock('../kafkaInstance', () => () => ({
  producer: () => ({
    connect: () => {},
    disconnect: () => {},
    events: {
      CRASH: 'CRASH',
      DISCONNECT: 'DISCONNECT',
      CONNECT: 'CONNECT',
      REQUEST_TIMEOUT: 'REQUEST_TIMEOUT'
    },
    on: () => {},
    send: () => {}
  })
}));

describe('producer', () => {
  afterEach(() => {
    expect.hasAssertions();
  });
  describe('init', () => {
    it('should return producer instance', async () => {
      const kproducer = producer.init({ serviceName: 'cacher' });
      expect(kproducer).toBeDefined();
    });
  });

  describe('connect', () => {
    it('should connect and not throw error', async () => {
      const kproducer = producer.init({ serviceName: 'cacher' });
      expect(await producer.connect(kproducer)).toBeUndefined();
      await kproducer.disconnect();
    });

    it('should send serialized message without any error', async () => {
      const kproducer = producer.init({ serviceName: 'cacher' });
      expect(
        await kproducer.sendSerializedValue({
          topic: 'seed_topic',
          messages: [
            {
              value: { foo: 'bar' }
            }
          ]
        })
      ).toBeUndefined();
      await kproducer.disconnect();
    });
  });
});
