import kproducer from '../../common/kafkaProducer';
import deliveryProducer from '../../deliveryManager/deliveryManager.producer';
import { IDelivery } from '../deliveryManager.interface';
import { Kafka } from '../../common/constant';

jest.mock('../../common/kafkaProducer');

describe('ddeliveryProducer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    expect.hasAssertions();
    jest.resetAllMocks();
  });

  it('should produce TOPIC to kafka when call produceDeliveryEventMessage', async () => {
    const topic = Kafka.TOPIC;
    const delivery: IDelivery = {
      _id: 'string'
    } as any;

    const serializedMessage = {
      topic,
      messages: [
        {
          key: delivery._id,
          value: delivery
        }
      ]
    };

    await deliveryProducer.produceDeliveryMessage(delivery);

    expect(kproducer.sendSerializedValue).toBeCalledWith(serializedMessage);
  });
});
