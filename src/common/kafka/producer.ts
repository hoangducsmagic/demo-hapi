import kafka from './kafkaInstance';
import logger from '../../logger';
import { Producer, ProducerEvents, RecordMetadata } from 'kafkajs';

import { InitConfig, ProducerWrapper, ProducerRecordWrapper } from './type';
import { getNamespace } from 'cls-hooked';
import { Tracing } from '../../common/constant';

const init = (config: InitConfig): ProducerWrapper => {
  const serviceName = config.serviceName;
  const defaultConfig = { idempotent: true };
  const consolidatedConfig = config
    ? { ...defaultConfig, ...config }
    : defaultConfig;
  const producer = kafka(serviceName).producer(consolidatedConfig);
  const {
    CONNECT,
    DISCONNECT,
    REQUEST_TIMEOUT
  }: ProducerEvents = producer.events;

  // Listen to events
  producer.on(CONNECT, () => logger.info(`Producer ${CONNECT}`));
  producer.on(DISCONNECT, () => logger.info(`Producer ${DISCONNECT}`));
  producer.on(REQUEST_TIMEOUT, payload =>
    logger.error(`Producer ${REQUEST_TIMEOUT}`, payload)
  );

  const sendSerializedValue = async (
    record: ProducerRecordWrapper
  ): Promise<RecordMetadata[]> => {
    const session = getNamespace(Tracing.TRACER_SESSION);
    const headers = session
      ? {
          [Tracing.TRANSACTION_ID]: session.get(Tracing.TRANSACTION_ID)
        }
      : {};
    // key in message to be hash for choose number partition for sequence message process
    const formattedMessages = record.messages.map(message => {
      const stringifiedValue = JSON.stringify(message.value);
      return { ...message, value: stringifiedValue, headers };
    });
    const formattedRecord = { ...record, messages: formattedMessages };
    return await producer.send(formattedRecord);
  };

  const enhancedProducer: ProducerWrapper = {
    ...producer,
    sendSerializedValue
  };

  return enhancedProducer;
};

const connect = async (producer: Producer): Promise<void> =>
  await producer.connect();

const kafkaProducer = { connect, init };

export default kafkaProducer;
