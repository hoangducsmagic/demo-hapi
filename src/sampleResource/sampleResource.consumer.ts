import {
  IFormattedMessageType,
  IMessageProcessorCallbackPayload,
  ITopicsMap
} from '../common/kafka/type';
import { ERROR_CODE } from '../common/errors';
import logger from '../logger';
import { Kafka } from '../common/constant';
import { sampleResourceService } from './sampleResource.service';
import { ISampleResource } from './sampleResource.interface';
import { AppError } from '../common/error/AppError';

const consumeTopicMessage = async (
  kafkaMessage: IMessageProcessorCallbackPayload
): Promise<void> => {
  const { value }: IFormattedMessageType = kafkaMessage.message;
  const sampleResource = value as ISampleResource;

  await sampleResourceService.updateTopicMessage(sampleResource);
};

const topicsMap: ITopicsMap = {
  [Kafka.TOPIC]: async (messageToConsume: any): Promise<void> => {
    logger.info(`Consuming data: ${JSON.stringify(messageToConsume)}`);
    if (!messageToConsume) {
      throw new AppError(ERROR_CODE.KAFKA_UNEXPECTED_ERROR);
    }
    return await consumeTopicMessage(messageToConsume);
  }
};

const transactionConsumerService = {
  topicsMap,
  consumeTopicMessage
};

export default transactionConsumerService;
