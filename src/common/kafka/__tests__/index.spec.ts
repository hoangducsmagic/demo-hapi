import { consumer, producer } from '../index';

describe('kafka', () => {
  it('kafka consumer and producer should call kafka module', () => {
    expect(consumer).toBeDefined();
    expect(producer).toBeDefined();
  });
});
