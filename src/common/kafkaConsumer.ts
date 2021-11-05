import { get } from 'lodash';
import deliveryConsumer from '../sampleResource/sampleResource.consumer';
import config from '../config';
import { Kafka } from './constant';
import { consumer } from './kafka/index';

const kconsumer = consumer.init({
  groupId: Kafka.CONSUMER_GROUP
});

const connect = () => {
  const partitionsConsumedConcurrently = get(
    config,
    'kafka.partitionsConsumedConcurrently',
    undefined
  );
  consumer.connectSubscribeRun(
    kconsumer,
    {
      ...deliveryConsumer.topicsMap
    },
    partitionsConsumedConcurrently
      ? parseInt(partitionsConsumedConcurrently)
      : undefined
  );
};

const kafka = {
  connect
};

export default kafka;
