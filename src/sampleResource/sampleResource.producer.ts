import { Kafka } from '../common/constant';
import { IKafkaProducerMessage } from '../common/kafka/type';
import producer from '../common/kafkaProducer';
import logger from '../logger';
import { ISampleResource } from './sampleResource.interface';

const produceTransactionWithTopic = async (
  topic: string,
  value: IKafkaProducerMessage
): Promise<void> => {
  logger.info(`Message will send ${JSON.stringify(value)}`);
  await producer.sendSerializedValue({
    topic: topic,
    messages: [
      {
        key: value._id,
        value: value
      }
    ]
  });
};

const produceSampleResourceMessage = async (
  sampleResource: ISampleResource
): Promise<void> => {
  await produceTransactionWithTopic(Kafka.TOPIC, sampleResource);
};

const sampleResourceProducer = {
  produceSampleResourceMessage
};

export default sampleResourceProducer;
