import { createNamespace, destroyNamespace } from 'cls-hooked';
import { Tracing } from '../common/constant';

// no type definitions available for expose-gc. Hence require
const garbageCollector = require('expose-gc/function');
afterEach(() => {
  expect.hasAssertions();
});
const session = Tracing.TRACER_SESSION;
beforeAll(() => {
  createNamespace(session);
});
afterAll(() => {
  try {
    garbageCollector();
    destroyNamespace(session);
  } catch {}
});

jest.mock('../common/kafka/index', () => ({
  producer: {
    init: jest.fn(() => ({
      sendSerializedValue: jest.fn()
    }))
  },
  consumer: {
    init: jest.fn(() => ({
      connectSubscribeRun: jest.fn()
    }))
  }
}));

jest.mock('../common/redis/index', () => ({
  connectRedis: jest.fn()
}));
