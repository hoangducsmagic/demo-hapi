import kafka from './kafkaInstance';
import {
  EachBatchPayload,
  EachMessagePayload,
  ConsumerEvents,
  ConsumerConfig,
  Consumer,
  IHeaders
} from 'kafkajs';
import logger from '../../logger';
import {
  IFormattedMessageType,
  ITopicsMap,
  IMessageProcessorCallbackPayload,
  IMessageHeaders
} from './type';
import { CALLBACK_IS_NOT_A_FUNCTION, GROUP_ID_IS_REQUIRED } from './constants';
import { getNamespace } from 'cls-hooked';
import { Tracing } from '../constant';
const has = Object.prototype.hasOwnProperty;

const init = (consumerConfig: ConsumerConfig): Consumer => {
  const groupId: string = consumerConfig && consumerConfig.groupId;
  if (!groupId) throw new Error(GROUP_ID_IS_REQUIRED);

  const defaultConfig = { groupId };
  const consolidatedConfig = consumerConfig
    ? { ...defaultConfig, ...consumerConfig }
    : defaultConfig;

  const consumer = kafka(groupId).consumer(consolidatedConfig);

  const {
    CRASH,
    DISCONNECT,
    CONNECT,
    REQUEST_TIMEOUT
  }: ConsumerEvents = consumer.events;

  consumer.on(CRASH, error => {
    logger.error(`Consumer ${CRASH}`, error);
  });
  consumer.on(CONNECT, () => {
    logger.info(`Consumer ${CONNECT}`);
  });
  consumer.on(DISCONNECT, () => {
    logger.error(`Consumer ${DISCONNECT}`);
  });
  consumer.on(REQUEST_TIMEOUT, () => {
    logger.error(`Consumer ${REQUEST_TIMEOUT}`);
  });

  return consumer;
};

const parseHeaders = (headers: IHeaders): IMessageHeaders => {
  let messageHeaders: IMessageHeaders = {};
  for (let header in headers) {
    const value = headers[header];
    if (value) messageHeaders[header] = value.toString();
  }
  return messageHeaders;
};

const handleMessage = (topicsMap: ITopicsMap) => async ({
  message,
  topic: topicName,
  partition
}: EachMessagePayload) => {
  const messageProcessorCallback = topicsMap[topicName];
  if (typeof messageProcessorCallback !== 'function') {
    throw new Error(CALLBACK_IS_NOT_A_FUNCTION);
  }
  try {
    logger.debug(
      `handleEachMessage >>> ${topicName} >>> ${partition} >>> ${message.key} >>> ${message.offset}`
    );
    const key: string = message.key && message.key.toString();
    const value: unknown = JSON.parse(
      message.value ? message.value.toString() : ''
    );
    const headers: IMessageHeaders = parseHeaders(message.headers || {});
    if (has.call(headers, Tracing.TRANSACTION_ID)) {
      const session = getNamespace(Tracing.TRACER_SESSION);
      if (session) {
        const clsCtx = session.createContext();
        session.enter(clsCtx);
        session.set(Tracing.TRANSACTION_ID, headers[Tracing.TRANSACTION_ID]);
      }
    }
    const formattedMessage: IFormattedMessageType = { key, value, headers };
    const callBackPayload: IMessageProcessorCallbackPayload = {
      topicName,
      partition,
      message: formattedMessage
    };
    await messageProcessorCallback(callBackPayload);
  } catch (error) {
    logger.error(
      `handleMessage >>> ${topicName} >>> ${partition} >>> ${message.key} >>> ${message.offset} threw error `,
      error
    );
  }
};

const handleBatch = (topicsMap: ITopicsMap) => async ({
  batch,
  resolveOffset,
  isRunning,
  isStale,
  heartbeat
}: EachBatchPayload) => {
  for (let message of batch.messages) {
    if (!isRunning() || isStale()) break;
    const topicName: string = batch.topic;
    const partition: number = batch.partition;
    const messageProcessorCallback = topicsMap[topicName];
    if (typeof messageProcessorCallback !== 'function') {
      throw new Error(CALLBACK_IS_NOT_A_FUNCTION);
    }
    try {
      const key: string = message.key && message.key.toString();
      const value: unknown = JSON.parse(
        message.value ? message.value.toString() : ''
      );
      const headers: IMessageHeaders = parseHeaders(message.headers || {});
      if (has.call(headers, Tracing.TRANSACTION_ID)) {
        const session = getNamespace(Tracing.TRACER_SESSION);
        if (session) {
          const clsCtx = session.createContext();
          session.enter(clsCtx);
          session.set(Tracing.TRANSACTION_ID, headers[Tracing.TRANSACTION_ID]);
        }
      }
      const formattedMessage: IFormattedMessageType = { key, value, headers };
      const callBackPayload: IMessageProcessorCallbackPayload = {
        topicName,
        partition,
        message: formattedMessage
      };
      await messageProcessorCallback(callBackPayload);
    } catch (error) {
      logger.error(
        `handleBatch >>> ${topicName} >>> ${partition} >>> ${message.offset} threw error `,
        error
      );
    } finally {
      resolveOffset(message.offset);
      await heartbeat();
    }
  }
};

const connectSubscribeRun = async (
  consumer: Consumer,
  topicsMap: ITopicsMap,
  partitionsConsumedConcurrently?: number | undefined
): Promise<void> => {
  await consumer.connect();
  const subscribedTopicsList = Object.keys(topicsMap).map(topic =>
    consumer.subscribe({ topic })
  );
  await Promise.all(subscribedTopicsList);
  logger.debug(
    `Now consume to kafka with partitionsConsumedConcurrently ${partitionsConsumedConcurrently}`
  );
  await consumer.run({
    eachMessage: handleMessage(topicsMap),
    partitionsConsumedConcurrently
  });
};

const kafkaConsumer = { connectSubscribeRun, init, handleBatch, handleMessage };

export default kafkaConsumer;
