import kafkaInstance from '../kafkaInstance';

describe('kafkaInstance', () => {
  describe('getKafkaInstance', () => {
    it('should return kafka instance', () => {
      expect(kafkaInstance('module-service')).toBeDefined();
      expect(kafkaInstance('module-service').consumer).toBeDefined();
      expect(kafkaInstance('module-service').producer).toBeDefined();
    });
  });
});
