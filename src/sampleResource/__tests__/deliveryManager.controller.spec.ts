/* eslint-disable @typescript-eslint/camelcase */
import { Server, ServerInjectResponse } from '@hapi/hapi';
import { deliveryService } from '../deliveryManager.service';
import deliveryController from '../deliveryManager.controller';
import {
  ICancelDeliveryOrder,
  ICreateDeliveryPayload,
  IDeliveryCancel,
  IDeliveryEstimateFee,
  IDeliveryEstimateFeeResponse,
  IRateDeliveryOrder,
  IDeliveryRate,
  ICreateDelivery
} from '../deliveryManager.interface';
import config from '../../config';
import {
  createEstimateFeeOutput,
  createOrderInputData,
  getDeliveryDetail
} from '../__mocks__/deliveryManager.data';
import { DeliveryProvider } from '../deliveryManager.enum';
import { AhaMoveDeliveryStatus } from '../../deliveryAdapter/ahaMoveAdapter/ahaMoveAdapter.enum';
import { WebhookPayload } from '../../deliveryAdapter/deliveryAdapter.interface';
import { pick } from 'lodash';
import { v4 } from 'uuid';
import { Method, StatusCode } from '../../common/http/htttp.enums';

jest.mock('../deliveryManager.service');

let server: Server;

describe('delivery.controller', () => {
  const invalidResponse = {
    error: 'Bad Request',
    message: 'Invalid request payload input',
    statusCode: StatusCode.BAD_REQUEST
  };

  beforeAll(async () => {
    server = new Server();
    server.route(deliveryController);
  });

  afterEach(() => {
    expect.hasAssertions();
    jest.resetAllMocks();
  });

  describe('#Get /delivery/{orderId}', () => {
    it('should call getDetail service and response data order Delivery', async () => {
      const orderId = '123';

      const resultExpect = getDeliveryDetail();
      deliveryService.getDetail = jest.fn().mockResolvedValueOnce(resultExpect);
      const response: ServerInjectResponse = await server.inject({
        method: Method.GET,
        url: `/${config.servicePath}/${orderId}`
      });

      expect(response.statusCode).toEqual(StatusCode.OK);
      expect(response.result).toEqual(resultExpect);
    });
  });

  describe('#CREATE /delivery/create', () => {
    it('should throw INVALID_REQUEST by path order is array empty', async () => {
      const payload: ICreateDelivery = {} as any;
      const response: ServerInjectResponse = await server.inject({
        method: Method.POST,
        url: `/${config.servicePath}/create`,
        payload: JSON.stringify(payload)
      });
      expect(deliveryService.createOrder).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toEqual(StatusCode.BAD_REQUEST);
      expect(response.result).toEqual(invalidResponse);
    });

    it('should call deliveryService and response successfully', async () => {
      const payload: ICreateDeliveryPayload = createOrderInputData();
      const resultExpect = 'data';
      deliveryService.createOrder = jest
        .fn()
        .mockResolvedValueOnce(resultExpect);

      const response: ServerInjectResponse = await server.inject({
        method: Method.POST,
        url: `/${config.servicePath}/create`,
        payload
      });

      expect(response.result).toEqual(resultExpect);
    });
  });

  describe('#CANCEL /delivery/cancel', () => {
    const payload: ICancelDeliveryOrder = {
      orderId: '20VBGT40',
      comment: 'Doi lau qua'
    };
    it('should call cancel deliveryService and response successfully', async () => {
      const resultExpect: IDeliveryCancel = { success: true };
      deliveryService.cancelOrder = jest
        .fn()
        .mockResolvedValueOnce(resultExpect);

      const response: ServerInjectResponse = await server.inject({
        method: Method.POST,
        url: `/${config.servicePath}/cancel`,
        payload
      });

      expect(response.statusCode).toEqual(StatusCode.OK);
      expect(response.result).toEqual(resultExpect);
    });

    it('should call cancel deliveryService and response 409 if success is false', async () => {
      const resultExpect: IDeliveryCancel = { success: false };
      deliveryService.cancelOrder = jest
        .fn()
        .mockResolvedValueOnce(resultExpect);

      const response: ServerInjectResponse = await server.inject({
        method: Method.POST,
        url: `/${config.servicePath}/cancel`,
        payload
      });

      expect(response.statusCode).toEqual(StatusCode.BAD_REQUEST);
      expect(response.result).toEqual(resultExpect);
    });
  });

  describe('#HOOK /delivery/partner/{provider}', () => {
    it('should call hook deliveryService and response successfully', async () => {
      const providerParams = DeliveryProvider.PROVIDER_AHAMOVE;
      const payload: WebhookPayload = {
        _id: 'ORDER_ID_01',
        status: AhaMoveDeliveryStatus.DELIVERY_ACCEPTED,
        city_id: 'VN-SG',
        service_id: 'BIKE-SG'
      } as any;

      deliveryService.receiveWebhook = jest
        .fn()
        .mockResolvedValueOnce(undefined);

      const response: ServerInjectResponse = await server.inject({
        method: Method.POST,
        url: `/${config.servicePath}/partner/${providerParams}`,
        payload
      });
      expect(response.statusCode).toEqual(StatusCode.OK);
      expect(response.result).toEqual({
        message: 'Received'
      });
    });
  });

  describe('#DELIVERY_FEE /delivery/estimateFee', () => {
    it('should call estimateFee and response successfully', async () => {
      const deliveryPayload: ICreateDeliveryPayload = createOrderInputData();
      const payload: IDeliveryEstimateFee = pick(deliveryPayload, [
        'provider',
        'dropoffAddress',
        'dropoffLocation',
        'pickupAddress',
        'pickupLocation',
        'paymentType'
      ]);

      const expected: IDeliveryEstimateFeeResponse = createEstimateFeeOutput();

      deliveryService.estimateFee = jest
        .fn()
        .mockResolvedValueOnce({ data: expected });

      const response: ServerInjectResponse = await server.inject({
        method: Method.POST,
        url: `/${config.servicePath}/estimateFee`,
        payload
      });

      expect(response.result).toEqual({ data: expected });
    });
  });

  describe('#RATE /deliveries/rate/{orderId}', () => {
    it('should call rate deliveryService and response successfully', async () => {
      const orderIdParams = v4();
      const payload: IRateDeliveryOrder = {
        rating: 5,
        feedback: 'good job!'
      };
      const resultExpect: IDeliveryRate = { orderId: orderIdParams };
      deliveryService.rateOrder = jest.fn().mockResolvedValueOnce(resultExpect);

      const response: ServerInjectResponse = await server.inject({
        method: Method.POST,
        url: `/${config.servicePath}/rate/${orderIdParams}`,
        payload
      });

      expect(response.statusCode).toEqual(StatusCode.OK);
      expect(response.result).toEqual(resultExpect);
    });
  });

  describe('#RATE /deliveries/rate/{orderId}', () => {
    it('should call rate deliveryService and response error', async () => {
      const orderIdParams = v4();
      const payload: IRateDeliveryOrder = {
        rating: 6
      };
      const resultExpect = {
        message: 'Invalid request.',
        code: 'INVALID_REQUEST',
        errors: [
          {
            message: 'This field does not have the correct format.',
            code: 'INVALID_FIELD',
            key: 'rating'
          }
        ]
      };
      deliveryService.rateOrder = jest.fn().mockResolvedValueOnce(resultExpect);

      const response: ServerInjectResponse = await server.inject({
        method: Method.POST,
        url: `/${config.servicePath}/rate/${orderIdParams}`,
        payload
      });

      expect(response.statusCode).toEqual(StatusCode.BAD_REQUEST);
    });
  });
});
