import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { DeliveryModel } from '../deliveryManager.model';
import { createOrderInput } from '../__mocks__/deliveryManager.data';
import {
  PaymentType,
  DeliveryFeeType,
  DeliveryStatus,
  DeliveryProvider
} from '../deliveryManager.enum';
import { AhaMoveServiceCode } from '../../deliveryAdapter/ahaMoveAdapter/ahaMoveAdapter.enum';
import deliveryRepository from '../deliveryManager.repository';
import { IDelivery } from '../deliveryManager.interface';

jest.mock('mongoose', () => {
  const mongoose = jest.requireActual('mongoose');
  return new mongoose.Mongoose(); // new mongoose instance and connection for each test
});

describe('deliveryManager.repository', () => {
  let mongod: MongoMemoryServer;
  beforeAll(async () => {
    mongod = new MongoMemoryServer();
    const mongoDbUri = await mongod.getUri();
    await mongoose.connect(mongoDbUri, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    });
  });

  afterEach(async () => {
    expect.hasAssertions();
    jest.clearAllMocks();
    await DeliveryModel.deleteMany({});
  });

  afterAll(async () => {
    await mongod.stop();
    await mongoose.connection.close();
  });

  describe('findOne', () => {
    it('should get the first delivery matching with conditions', async () => {
      const input = createOrderInput(
        PaymentType.CASHLESS,
        DeliveryProvider.PROVIDER_AHAMOVE,
        AhaMoveServiceCode.SGN_EXPRESS,
        DeliveryFeeType.FEE_TYPE_DYNAMIC,
        DeliveryStatus.DELIVERY_IDLE
      );
      const newDelivery = await DeliveryModel.create(input as any);
      const response = await deliveryRepository.findOne({
        _id: newDelivery._id
      });
      expect(response).toBeDefined();
    });
  });

  describe('find', () => {
    it('should get delivery matching with conditions', async () => {
      const input = createOrderInput(
        PaymentType.CASHLESS,
        DeliveryProvider.PROVIDER_AHAMOVE,
        AhaMoveServiceCode.SGN_EXPRESS,
        DeliveryFeeType.FEE_TYPE_DYNAMIC,
        DeliveryStatus.DELIVERY_IDLE
      );
      const newDelivery = await DeliveryModel.create(input as any);
      const response = await deliveryRepository.getById(newDelivery._id);
      expect(response).toBeDefined();
    });
  });

  describe('create', () => {
    it('should create a new delivery', async () => {
      const input = createOrderInput(
        PaymentType.CASHLESS,
        DeliveryProvider.PROVIDER_AHAMOVE,
        AhaMoveServiceCode.SGN_EXPRESS,
        DeliveryFeeType.FEE_TYPE_DYNAMIC,
        DeliveryStatus.DELIVERY_IDLE
      );
      const newDelivery = await deliveryRepository.create(input as any);

      expect(newDelivery).toBeDefined();
    });
  });

  describe('update', () => {
    it('should update status delivery matching conditions', async () => {
      const input = createOrderInput(
        PaymentType.CASHLESS,
        DeliveryProvider.PROVIDER_AHAMOVE,
        AhaMoveServiceCode.SGN_EXPRESS,
        DeliveryFeeType.FEE_TYPE_DYNAMIC,
        DeliveryStatus.DELIVERY_IDLE
      );
      const delivery = await DeliveryModel.create(input as any);

      const updateDelivery = await deliveryRepository.updateById(
        delivery._id,
        { ...input, status: DeliveryStatus.DELIVERY_ASSIGNING } as any,
        'en'
      );
      expect(updateDelivery).toBeDefined();
      expect((updateDelivery as IDelivery).status).toEqual(
        DeliveryStatus.DELIVERY_ASSIGNING
      );
    });

    it('should divided timeline and push inside subdocument', async () => {
      const input = createOrderInput(
        PaymentType.CASHLESS,
        DeliveryProvider.PROVIDER_AHAMOVE,
        AhaMoveServiceCode.SGN_EXPRESS,
        DeliveryFeeType.FEE_TYPE_DYNAMIC,
        DeliveryStatus.DELIVERY_IDLE
      );
      const delivery = await DeliveryModel.create(input as any);

      const updateDelivery = await deliveryRepository.updateById(
        delivery._id,
        {
          ...input,
          timeline: [
            {
              status: DeliveryStatus.DELIVERY_CANCELLED,
              time: new Date()
            }
          ],
          status: DeliveryStatus.DELIVERY_ASSIGNING
        } as any,
        'en'
      );
      expect(updateDelivery).toBeDefined();
      expect((updateDelivery as IDelivery).status).toEqual(
        DeliveryStatus.DELIVERY_ASSIGNING
      );
      expect(updateDelivery?.timeline).toHaveLength(1);
    });
  });

  describe('updateById', () => {
    it('should update status delivery matching conditions', async () => {
      const input = createOrderInput(
        PaymentType.CASHLESS,
        DeliveryProvider.PROVIDER_AHAMOVE,
        AhaMoveServiceCode.SGN_EXPRESS,
        DeliveryFeeType.FEE_TYPE_DYNAMIC,
        DeliveryStatus.DELIVERY_IDLE
      );
      const delivery = await DeliveryModel.create(input as any);

      const updateDelivery = await deliveryRepository.update(
        { _id: delivery._id },
        { ...input, status: DeliveryStatus.DELIVERY_ASSIGNING } as any,
        false
      );
      expect(updateDelivery).toBeDefined();
      expect((updateDelivery as IDelivery).status).toEqual(
        DeliveryStatus.DELIVERY_ASSIGNING
      );
    });

    it('should divided timeline and push inside subdocument', async () => {
      const input = createOrderInput(
        PaymentType.CASHLESS,
        DeliveryProvider.PROVIDER_AHAMOVE,
        AhaMoveServiceCode.SGN_EXPRESS,
        DeliveryFeeType.FEE_TYPE_DYNAMIC,
        DeliveryStatus.DELIVERY_IDLE
      );
      const delivery = await DeliveryModel.create(input as any);

      const updateDelivery = await deliveryRepository.update(
        { _id: delivery._id },
        {
          ...input,
          timeline: [
            {
              status: DeliveryStatus.DELIVERY_CANCELLED,
              time: new Date()
            }
          ],
          status: DeliveryStatus.DELIVERY_ASSIGNING
        } as any,
        true
      );
      expect(updateDelivery).toBeDefined();
      expect((updateDelivery as IDelivery).status).toEqual(
        DeliveryStatus.DELIVERY_ASSIGNING
      );
      expect(updateDelivery?.timeline).toHaveLength(1);
    });
  });
});
