import { AhaMoveServiceCode } from '../../deliveryAdapter/ahaMoveAdapter/ahaMoveAdapter.enum';
import {
  DeliveryFeeType,
  DeliveryProvider,
  DeliveryStatus,
  PaymentType
} from '../deliveryManager.enum';
import { createOrderInput } from '../__mocks__/deliveryManager.data';
import { deliveryDispatchingRules } from '../deliveryManager.dispatchingRule';
import { ahaMoveService } from '../../deliveryAdapter/ahaMoveAdapter/ahaMoveAdapter.service';
import { mxService } from '../../internalService/MX/mx.service';
import config from '../../config';
import deliveryRepository from '../deliveryManager.repository';
import uuid from 'uuid';
import mockDate from 'mockdate';
import { AppError } from '../../common/error/AppError';
import { ERROR_CODE } from '../../common/errors';

jest.mock('../../deliveryAdapter/ahaMoveAdapter/ahaMoveAdapter.service');
jest.mock('../../internalService/MX/mx.service');
jest.mock('uuid', () => {
  return {
    v4: () => '1234'
  };
});

describe('deliveryManager.service', () => {
  const now = new Date();
  const distanceNotSupported =
    config?.delivery.dispatchRules.deliveryDistanceNotSupport;
  beforeEach(() => {
    jest.clearAllMocks();
    expect.hasAssertions();
    mockDate.set(now);
    ahaMoveService.getEstimateOrderFee = jest.fn().mockResolvedValue({
      distance: 1000
    });
    mxService.notifyOrderStatus = jest.fn().mockResolvedValue(undefined);
  });

  describe('#deliveryDispatchingRules', () => {
    it('should throw Error if order distance is to far to supported', async () => {
      const orderData = createOrderInput(
        PaymentType.CASH,
        DeliveryProvider.PROVIDER_AHAMOVE,
        AhaMoveServiceCode.SGN_EXPRESS,
        DeliveryFeeType.FEE_TYPE_DYNAMIC,
        DeliveryStatus.DELIVERY_ASSIGNING
      );
      delete orderData.distance;
      const errorExpect = new AppError(ERROR_CODE.ORDER_DISTANCE_TOO_FAR);
      await deliveryDispatchingRules(orderData);
      expect(ahaMoveService.getEstimateOrderFee).toHaveBeenCalledTimes(1);
      expect(mxService.notifyOrderStatus).toHaveBeenCalledWith(
        {
          ...orderData,
          status: DeliveryStatus.DELIVERY_FAILED
        },
        undefined,
        errorExpect
      );
    });

    it('should throw error if updateById not found orderId matching with ahaMoveResponse order', async () => {
      const orderData = createOrderInput(
        PaymentType.CASH,
        DeliveryProvider.PROVIDER_AHAMOVE,
        AhaMoveServiceCode.SGN_EXPRESS,
        DeliveryFeeType.FEE_TYPE_DYNAMIC,
        DeliveryStatus.DELIVERY_ASSIGNING
      );
      orderData.distance = 1;
      const orderResponse = {
        ...orderData,
        providerDeliveryId: '123',
        providerServiceCode: AhaMoveServiceCode.SGN_EXPRESS,
        feeType: DeliveryFeeType.FEE_TYPE_DYNAMIC,
        status: DeliveryStatus.DELIVERY_IDLE,
        dropoffAddress: orderData.dropoffAddress,
        pickupAddress: orderData.pickupAddress
      };
      (uuid as any).v4 = jest.fn().mockReturnValue('123');
      ahaMoveService.getProviderService = jest
        .fn()
        .mockReturnValue(AhaMoveServiceCode.SGN_EXPRESS);
      deliveryRepository.create = jest.fn().mockResolvedValueOnce({
        _id: '5f0fe465d994dc16c3c78bac',
        ...orderResponse
      });
      ahaMoveService.createOrder = jest.fn().mockResolvedValueOnce(orderData);
      deliveryRepository.updateById = jest.fn().mockResolvedValueOnce(null);

      const response = await deliveryDispatchingRules(orderData);

      expect(ahaMoveService.getEstimateOrderFee).not.toHaveBeenCalled();
      expect(deliveryRepository.create).toHaveBeenCalledWith(orderResponse);
      expect(ahaMoveService.createOrder).toHaveBeenCalledWith(
        '5f0fe465d994dc16c3c78bac',
        orderData
      );
      expect(deliveryRepository.updateById).toHaveBeenCalledTimes(1);
      expect(mxService.notifyOrderStatus).toHaveBeenCalledWith(
        { _id: '5f0fe465d994dc16c3c78bac', ...orderResponse },
        undefined,
        new AppError(ERROR_CODE.DELIVERY_NOT_FOUND)
      );
    });

    it('should create delivery successfully and not call mxService to notify', async () => {
      const orderData = createOrderInput(
        PaymentType.CASH,
        DeliveryProvider.PROVIDER_AHAMOVE,
        AhaMoveServiceCode.SGN_EXPRESS,
        DeliveryFeeType.FEE_TYPE_DYNAMIC,
        DeliveryStatus.DELIVERY_ASSIGNING
      );
      orderData.distance = 1;
      const orderResponse = {
        ...orderData,
        providerDeliveryId: '123',
        providerServiceCode: AhaMoveServiceCode.SGN_EXPRESS,
        feeType: DeliveryFeeType.FEE_TYPE_DYNAMIC,
        status: DeliveryStatus.DELIVERY_IDLE,
        dropoffAddress: orderData.dropoffAddress,
        pickupAddress: orderData.pickupAddress
      };
      (uuid as any).v4 = jest.fn().mockReturnValue('123');
      ahaMoveService.getProviderService = jest
        .fn()
        .mockReturnValue(AhaMoveServiceCode.SGN_EXPRESS);
      deliveryRepository.create = jest.fn().mockResolvedValueOnce({
        _id: '5f0fe465d994dc16c3c78bac',
        ...orderResponse
      });
      ahaMoveService.createOrder = jest.fn().mockResolvedValueOnce(orderData);
      deliveryRepository.updateById = jest
        .fn()
        .mockResolvedValueOnce(orderResponse);

      const response = await deliveryDispatchingRules(orderData);

      expect(ahaMoveService.getEstimateOrderFee).not.toHaveBeenCalled();
      expect(deliveryRepository.create).toHaveBeenCalledWith(orderResponse);
      expect(ahaMoveService.createOrder).toHaveBeenCalledWith(
        '5f0fe465d994dc16c3c78bac',
        orderData
      );
      expect(deliveryRepository.updateById).toHaveBeenCalledTimes(1);
      expect(mxService.notifyOrderStatus).not.toHaveBeenCalled();
    });
  });
});
