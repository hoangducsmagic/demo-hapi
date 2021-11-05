import { deliveryService } from '../deliveryManager.service';
import { ahaMoveService } from '../../deliveryAdapter/ahaMoveAdapter/ahaMoveAdapter.service';
import { AppError } from '../../common/error/AppError';
import { ERROR_CODE } from '../../common/errors';
import { DeliveryStatus, DeliveryProvider } from '../deliveryManager.enum';
import { ahaMoveWebhookRequestData } from '../../deliveryAdapter/ahaMoveAdapter/__mocks__/ahaMoveAdapter.data';
import {
  getDeliveryEstimateFee,
  createEstimateFeeOutput,
  createOrderCompleted,
  getRateDelivery
} from '../__mocks__/deliveryManager.data';
import deliveryRepository from '../deliveryManager.repository';
import { getDeliveryDetail } from '../__mocks__/deliveryManager.data';
import { integrationLogService } from '../../integrationLog/integrationLog.service';
import { mxService } from '../../internalService/MX/mx.service';
import { ICancelDeliveryOrder } from '../deliveryManager.interface';

// import { AhaMoveServiceCode } from '../../deliveryAdapter/ahaMoveAdapter/ahaMoveAdapter.enum';
jest.mock('../../integrationLog/integrationLog.service');
jest.mock('../../deliveryAdapter/ahaMoveAdapter/ahaMoveAdapter.service');
jest.mock('../deliveryManager.repository');
jest.mock('../../internalService/MX/mx.service');

describe('deliveryManager.service', () => {
  afterEach(() => {
    jest.clearAllMocks();
    expect.hasAssertions();
  });
  describe('getDetail', () => {
    it('shoudl throw error DELIVERY NOT FOUND', async () => {
      deliveryRepository.findOne = jest.fn().mockResolvedValueOnce(null);
      const orderId = '1234';
      try {
        await deliveryService.getDetail(orderId);
      } catch (error) {
        expect(deliveryRepository.findOne).toHaveBeenCalledWith({
          $or: [
            { orderId },
            { partnerOrderId: orderId },
            { providerDeliveryId: orderId }
          ]
        });
        expect(error).toBeInstanceOf(AppError);
        expect(error.errorCode).toEqual(ERROR_CODE.DELIVERY_NOT_FOUND);
      }
    });

    it('should return delivery matching orderId', async () => {
      const responseExpect = getDeliveryDetail();
      const orderId = 'S1161413';
      deliveryRepository.findOne = jest
        .fn()
        .mockResolvedValueOnce(responseExpect);
      const response = await deliveryService.getDetail(orderId);

      expect(deliveryRepository.findOne).toHaveBeenCalledWith({
        $or: [
          { orderId },
          { partnerOrderId: orderId },
          { providerDeliveryId: orderId }
        ]
      });
      expect(response.orderId).toEqual('S1161413');
    });
  });

  describe('updateTopicMessage', () => {
    it('should call', async () => {
      await deliveryService.updateTopicMessage('Hello');
      expect(deliveryRepository.getById).toHaveBeenCalledTimes(0);
    });
  });
  // describe('createOrder', () => {
  //   it('should throw ERROR if getToken failed and never call ahaMoveService.createOrder', async () => {
  //     ahaMoveService.createOrder = jest
  //       .fn()
  //       .mockRejectedValueOnce(new AppError(ERROR_CODE.INVALID_REQUEST));

  //     expect(
  //       await deliveryService.createOrder(createOrderInputData())
  //     ).toBeDefined();
  //   });

  // it('should throw ERROR if call ahaMoveService.createOrder failed', async () => {
  //   const input = createOrderInputData();
  //   const tokenExpect = { token: 'token partner of ahaMoveService.getToken' };
  //   ahaMoveService.getToken = jest.fn().mockResolvedValueOnce(tokenExpect);
  //   ahaMoveService.createOrder = jest
  //     .fn()
  //     .mockRejectedValueOnce(new AppError(ERROR_CODE.INVALID_REQUEST));

  //   try {
  //     await deliveryService.createOrder(input);
  //   } catch (error) {
  //     expect(ahaMoveService.getToken).toHaveBeenCalledWith();
  //     expect(ahaMoveService.createOrder).toHaveBeenCalledWith(
  //       createMapperOrderAhaMove(input, tokenExpect.token)
  //     );
  //     expect(error).toBeInstanceOf(AppError);
  //     expect(error.errorCode).toEqual(ERROR_CODE.INVALID_REQUEST);
  //   }
  // });

  // it('should createOrder successfully and call ahaMoveService.createOrder 1 times', async () => {
  //   const input = {
  //     ...createOrderInputData(),
  //     type: 'type',
  //     remarks: 'call me',
  //     promoCode: 'sales 50%',
  //     idleUntil: 5000,
  //     images: ['1', '2', '3']
  //   };
  //   const tokenExpect = { token: 'token partner of ahaMoveService.getToken' };
  //   const responseExpect = ahaMoveOrderResponseData();
  //   ahaMoveService.getToken = jest.fn().mockResolvedValueOnce(tokenExpect);
  //   ahaMoveService.createOrder = jest
  //     .fn()
  //     .mockResolvedValueOnce(responseExpect);

  //   const response = await deliveryService.createOrder(input);
  //   expect(ahaMoveService.getToken).toHaveBeenCalledWith();
  //   expect(ahaMoveService.createOrder).toHaveBeenCalledWith(
  //     createMapperOrderAhaMove(input, tokenExpect.token)
  //   );
  //   expect(response).toEqual({ id: responseExpect.order_id });
  // });
  // });

  describe('#notifyOrderStatus', () => {
    it('should choose ahaMoveService call processWebhookData but just store log not update model', async () => {
      const providerDeliveryId = 'OrderId001';
      const request = ahaMoveWebhookRequestData(providerDeliveryId);
      request._id = '123-23';
      const dataExpect = {
        _id: '1234',
        orderId: 'OrderId001',
        status: DeliveryStatus.DELIVERY_COMPLETED
      };
      integrationLogService.createLog = jest.fn().mockResolvedValueOnce({});
      ahaMoveService.processWebhookData = jest.fn().mockResolvedValueOnce({
        dataUpdate: {
          status: DeliveryStatus.DELIVERY_ACCEPTED
        },
        isContinueUpdate: false
      });
      deliveryRepository.findOne = jest.fn().mockResolvedValueOnce(dataExpect);

      const response = await deliveryService.receiveWebhook(
        DeliveryProvider.PROVIDER_AHAMOVE,
        request
      );

      expect(ahaMoveService.processWebhookData).toHaveBeenCalledWith(request);
      expect(deliveryRepository.findOne).toHaveBeenCalledTimes(1);
      expect(deliveryRepository.update).not.toHaveBeenCalled();
      expect(mxService.notifyOrderStatus).not.toHaveBeenCalled();
      expect(response).toEqual(dataExpect);
    });

    it('should choose ahaMoveService call processWebhookData successfully', async () => {
      const providerDeliveryId = 'OrderId001';
      const request = ahaMoveWebhookRequestData(providerDeliveryId);
      const dataExpect = {
        _id: '1234',
        orderId: 'OrderId001',
        status: DeliveryStatus.DELIVERY_COMPLETED
      };
      ahaMoveService.processWebhookData = jest.fn().mockResolvedValueOnce({
        dataUpdate: {
          status: DeliveryStatus.DELIVERY_ACCEPTED
        },
        isContinueUpdate: true
      });
      mxService.notifyOrderStatus = jest.fn().mockResolvedValueOnce({
        orderId: 'OrderId001'
      });
      deliveryRepository.update = jest.fn().mockResolvedValue(dataExpect);
      integrationLogService.createLog = jest.fn().mockResolvedValueOnce(true);
      const response = await deliveryService.receiveWebhook(
        DeliveryProvider.PROVIDER_AHAMOVE,
        request
      );

      expect(ahaMoveService.processWebhookData).toHaveBeenCalledWith(request);
      expect(deliveryRepository.update).toHaveBeenCalledTimes(1);
      expect(response).toEqual(dataExpect);
    });

    it('should choose ahaMoveService call processWebhookData but error when update model', async () => {
      const providerDeliveryId = 'OrderId001';
      const request = ahaMoveWebhookRequestData(providerDeliveryId);
      integrationLogService.createLog = jest.fn().mockResolvedValueOnce({});
      ahaMoveService.processWebhookData = jest.fn().mockResolvedValue({
        dataUpdate: { status: DeliveryStatus.DELIVERY_ACCEPTED },
        isContinueUpdate: true
      });
      deliveryRepository.update = jest.fn().mockResolvedValueOnce(null);
      try {
        await deliveryService.receiveWebhook(
          DeliveryProvider.PROVIDER_AHAMOVE,
          request
        );
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.errorCode).toEqual(ERROR_CODE.DELIVERY_NOT_FOUND);
        expect(ahaMoveService.processWebhookData).toHaveBeenCalledWith(request);
        expect(deliveryRepository.update).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('#estimateFee', () => {
    it('should get and return estimateFee of backend', async () => {
      const estimateInfo = getDeliveryEstimateFee();
      const responseExpect = createEstimateFeeOutput();
      // ahaMoveService.getEstimateOrderFee = jest
      //   .fn()
      //   .mockResolvedValueOnce(responseExpect);
      // ahaMoveService.getServiceCode = jest
      //   .fn()
      //   .mockReturnValueOnce(AhaMoveServiceCode.SGN_EXPRESS);
      const response = await deliveryService.estimateFee(estimateInfo);

      // expect(ahaMoveService.getEstimateOrderFee).toHaveBeenCalledWith(
      //   estimateInfo
      // );
      // expect(ahaMoveService.getServiceCode).toHaveBeenCalledWith(
      //   'ho-chi-minh',
      //   'ho-chi-minh'
      // );
      expect(response).toEqual(responseExpect);
    });
  });

  describe('#rate', () => {
    it('should return orderId', async () => {
      const rateInfo = getRateDelivery();
      const createOrder = createOrderCompleted();
      const dataExpect = {
        _id: createOrder._id,
        orderId: createOrder.orderId,
        status: DeliveryStatus.DELIVERY_COMPLETED
      };
      const responseExpect = {
        orderId: createOrder.orderId
      };
      deliveryRepository.findOne = jest.fn().mockResolvedValueOnce(dataExpect);
      deliveryRepository.updateById = jest
        .fn()
        .mockResolvedValueOnce(dataExpect);
      const response = await deliveryService.rateOrder(
        createOrder.orderId,
        rateInfo
      );

      expect(deliveryRepository.findOne).toHaveBeenCalledTimes(1);
      expect(deliveryRepository.updateById).toHaveBeenCalledTimes(1);
      expect(response).toEqual(responseExpect);
    });

    it('should return ORDER_NOT_FOUND', async () => {
      const rateInfo = getRateDelivery();
      const dataExpect = null;

      deliveryRepository.findOne = jest.fn().mockResolvedValueOnce(dataExpect);
      deliveryRepository.updateById = jest
        .fn()
        .mockResolvedValueOnce(dataExpect);
      try {
        await deliveryService.rateOrder('123456', rateInfo);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.errorCode).toEqual(ERROR_CODE.ORDER_NOT_FOUND);
        expect(deliveryRepository.findOne).toHaveBeenCalledTimes(1);
        expect(deliveryRepository.updateById).toHaveBeenCalledTimes(0);
      }
    });

    it('should return INVALID_STATE', async () => {
      const rateInfo = getRateDelivery();
      const createOrder = {
        ...createOrderCompleted(),
        orderId: '63f01f9c-bc78-4365-a7da-35b5fe403923',
        status: 'DELIVERY_ASSIGNING'
      };
      const dataExpect = {
        _id: createOrder._id,
        orderId: createOrder.orderId,
        status: createOrder.status
      };

      deliveryRepository.findOne = jest.fn().mockResolvedValueOnce(dataExpect);
      deliveryRepository.updateById = jest
        .fn()
        .mockResolvedValueOnce(dataExpect);

      try {
        await deliveryService.rateOrder(createOrder.orderId, rateInfo);
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        expect(error.errorCode).toEqual(ERROR_CODE.INVALID_STATE);
        expect(deliveryRepository.findOne).toHaveBeenCalledTimes(1);
        expect(deliveryRepository.updateById).toHaveBeenCalledTimes(0);
      }
    });
  });

  describe('#cancelOrder', () => {
    it('should throw ERROR_CODE_NOT_FOUND when orderId not exist', async () => {
      const input: ICancelDeliveryOrder = {
        orderId: '1234'
      };

      deliveryRepository.findOne = jest.fn().mockResolvedValueOnce(null);

      try {
        await deliveryService.cancelOrder(input);
      } catch (error) {
        expect(deliveryRepository.findOne).toHaveBeenCalledWith({
          orderId: input.orderId
        });
        expect(error).toBeInstanceOf(AppError);
        expect(error.errorCode).toEqual(ERROR_CODE.INVALID_REQUEST);
      }
    });

    it('should throw ERROR_CODE_INVALID_STATE when state order not allow cancel', async () => {
      const input: ICancelDeliveryOrder = {
        orderId: '1234'
      };
      const deliveryExpect = {
        _id: '507f1f77bcf86cd799439011',
        orderId: '1234',
        status: DeliveryStatus.DELIVERY_COMPLETED
      };

      deliveryRepository.findOne = jest
        .fn()
        .mockResolvedValueOnce(deliveryExpect);

      try {
        await deliveryService.cancelOrder(input);
      } catch (error) {
        expect(deliveryRepository.findOne).toHaveBeenCalledWith({
          orderId: input.orderId
        });

        expect(error).toBeInstanceOf(AppError);
        expect(error.errorCode).toEqual(ERROR_CODE.INVALID_REQUEST);
      }
    });

    it('should update status CANCELLED and return the order have been cancel', async () => {
      const input: ICancelDeliveryOrder = {
        orderId: '1234'
      };
      const deliveryExpect = {
        _id: '507f1f77bcf86cd799439011',
        orderId: '1234',
        status: DeliveryStatus.DELIVERY_ACCEPTED,
        timeline: []
      };
      const deliveryResponse = {
        ...deliveryExpect,
        status: DeliveryStatus.DELIVERY_CANCELLED
      };

      deliveryRepository.findOne = jest
        .fn()
        .mockResolvedValueOnce(deliveryExpect);
      deliveryRepository.updateById = jest
        .fn()
        .mockResolvedValueOnce(deliveryResponse);
      ahaMoveService.cancelOrder = jest.fn().mockResolvedValueOnce({
        success: true
      });

      const mockDate = new Date();
      const spy = jest
        .spyOn(global, 'Date')
        .mockImplementation(() => mockDate as any);
      const response = await deliveryService.cancelOrder(input);

      expect(ahaMoveService.cancelOrder).toHaveBeenCalledWith(
        deliveryExpect,
        input
      );
      expect(deliveryRepository.updateById).toHaveBeenCalledWith(
        deliveryExpect._id,
        {
          ...deliveryExpect,
          status: DeliveryStatus.DELIVERY_CANCELLED,
          timeline: [
            ...deliveryExpect.timeline,
            {
              status: DeliveryStatus.DELIVERY_CANCELLED,
              time: mockDate
            }
          ]
        }
      );
      expect(response).toBeDefined();
      spy.mockRestore();
    });
  });
});
