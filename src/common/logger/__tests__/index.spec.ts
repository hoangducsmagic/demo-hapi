import { createNamespace, destroyNamespace } from 'cls-hooked';

import { createLogger } from '../index';
import WinstonLogger from '../WinstonLogger';
import { Tracing } from '../logger.interface';
import BaseLogWrapper from '../../logger';
describe('index logger', () => {
  let tracing: Tracing;
  const session = 'test-session';
  beforeAll(() => {
    createNamespace(session);
    tracing = {
      tracerSessionName: session,
      requestId: 'QWESRTYUIOP'
    };
  });
  afterAll(() => {
    destroyNamespace(session);
  });
  describe('createLogger', () => {
    it('should return an instance of winstonLogger', () => {
      const logger = createLogger({ tracing });
      expect(logger instanceof WinstonLogger).toBeTruthy();
    });
  });

  describe('BaseLogWrapper', () => {
    it('should define BaseLogWrapper', () => {
      expect(BaseLogWrapper).toBeDefined();
    });
  });
});
