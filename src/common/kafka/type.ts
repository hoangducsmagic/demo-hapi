import {
  Producer,
  RecordMetadata,
  Message,
  ProducerRecord,
  ProducerConfig,
  ITopicConfig
} from 'kafkajs';

interface IMessageHeaders {
  [key: string]: string;
}

export interface IKafkaProducerMessage {
  _id?: string;
}

interface IFormattedMessageType {
  key: string;
  value: unknown;
  headers: IMessageHeaders;
}

interface IMessageProcessorCallbackPayload {
  message: IFormattedMessageType;
  topicName: string;
  partition: number;
}

type IFuntionWithPromiseReturn = (
  messageToConsume?: IMessageProcessorCallbackPayload
) => Promise<any>;

interface ITopicsMap {
  [topicName: string]: IFuntionWithPromiseReturn;
}

interface ProducerWrapper extends Producer {
  sendSerializedValue: (
    record: ProducerRecordWrapper
  ) => Promise<RecordMetadata[]>;
}

interface StringifiedMessage extends Message {
  value: any;
}
interface ProducerRecordWrapper extends ProducerRecord {
  messages: StringifiedMessage[];
}

interface InitConfig extends ProducerConfig {
  serviceName: string;
}

interface CreateTopicsPayload {
  validateOnly?: boolean;
  waitForLeaders?: boolean;
  timeout?: number;
  topics: ITopicConfig[];
}

interface ITopicPartitionsCreatePayload {
  [key: string]: number;
}

interface IPartitionMetadata {
  partitionErrorCode: number;
  partitionId: number;
  leader: number;
  replicas: number[];
  isr: number[];
}

interface ITopicMetadata {
  name: string;
  partitions: IPartitionMetadata[];
}

export {
  InitConfig,
  ProducerWrapper,
  ProducerRecordWrapper,
  StringifiedMessage,
  ITopicsMap,
  IFormattedMessageType,
  IFuntionWithPromiseReturn,
  IMessageProcessorCallbackPayload,
  CreateTopicsPayload,
  ITopicPartitionsCreatePayload,
  ITopicMetadata,
  IMessageHeaders
};
