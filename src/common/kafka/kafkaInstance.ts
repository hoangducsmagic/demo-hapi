import { Kafka } from 'kafkajs';
import config from '../../config';

const getKafkaInstance = (serviceName: string) => {
  const kafka: Kafka = new Kafka({
    clientId: serviceName,
    brokers: config.kafka.brokers
  });
  return kafka;
};

export default getKafkaInstance;
