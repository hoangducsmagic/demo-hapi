import { IMessageProcessorCallbackPayload } from '../../common/kafka/type';
import {
  ICreateDeliveryPayload,
  IDelivery
} from '../deliveryManager.interface';
import deliveryConsumer from '../deliveryManager.consumer';
import { Kafka } from '../../common/constant';
import { deliveryService } from '../deliveryManager.service';
import { createOrderInputData } from '../__mocks__/deliveryManager.data';
import { v4 } from 'uuid';
import { AhaMoveServiceCode } from '../../deliveryAdapter/ahaMoveAdapter/ahaMoveAdapter.enum';
import { DeliveryFeeType, DeliveryStatus } from '../deliveryManager.enum';
import { AppError } from '../../common/error/AppError';

jest.mock('../deliveryManager.service');

describe('deliveryConsumer', () => {
  afterEach(() => {
    jest.clearAllMocks();
    expect.hasAssertions();
  });
  it('should call updateTopicMessage', async () => {
    // Given
    const deliveryPayload: ICreateDeliveryPayload = createOrderInputData();
    const delivery: IDelivery = {
      ...deliveryPayload,
      createdAt: new Date(),
      updatedAt: new Date(),
      _id: '1ID',
      providerDeliveryId: v4(),
      providerServiceCode: AhaMoveServiceCode.SGN_EXPRESS,
      feeType: DeliveryFeeType.FEE_TYPE_DYNAMIC,
      status: DeliveryStatus.DELIVERY_IDLE
    };

    const topicName = Kafka.TOPIC;
    const messagePayload: IMessageProcessorCallbackPayload = {
      message: {
        key: '',
        headers: {},
        value: delivery
      },
      partition: 0,
      topicName
    };

    deliveryService.updateTopicMessage = jest.fn();

    // When
    await deliveryConsumer.topicsMap[topicName](messagePayload);

    // Then
    expect(deliveryService.updateTopicMessage).toBeCalledWith(delivery);
  });

  it('should throw error when message to consume not exist', async () => {
    // Given
    const topicName = Kafka.TOPIC;
    const messagePayload = undefined;
    // When
    try {
      await deliveryConsumer.topicsMap[topicName](messagePayload);
    } catch (error) {
      // Then
      expect(error).toBeInstanceOf(AppError);
      expect(deliveryService.updateTopicMessage).not.toBeCalled();
    }
  });
});
