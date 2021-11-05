import logger from '../logger';
import http from './http';
import { AppError, createErrorDetail, ErrorDetails } from './error/AppError';
import config from '../config';

const MONGO_ERROR = 'MongoError';
enum MONGO_ERROR_CODE {
  DUPLICATED_KEY = 11000
}

enum ERROR_CODE {
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DUPLICATED_KEY = 'DUPLICATED_KEY',
  FIELD_REQUIRED = 'FIELD_REQUIRED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  KAFKA_UNEXPECTED_ERROR = 'KAFKA_UNEXPECTED_ERROR',
  INVALID_FIELD = 'INVALID_FIELD',
  INVALID_STATE = 'INVALID_STATE',
  SERVICE_NOT_AVAILABLE_IN_ZONE = 'SERVICE_NOT_AVAILABLE_IN_ZONE',
  DELIVERY_NOT_FOUND = 'DELIVERY_NOT_FOUND',
  CITY_CODE_INVALID = 'CITY_CODE_INVALID',
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ORDER_DISTANCE_TOO_FAR = 'ORDER_DISTANCE_TOO_FAR',
  ORDER_DATA_INVALID = 'ORDER_DATA_INVALID',
  HAVE_NO_UPDATED = 'HAVE_NO_UPDATED'
}

// customized error message for joi
const JoiValidationErrors = {
  required: ERROR_CODE.FIELD_REQUIRED
};

const ErrorList = {
  // Common Errors
  [ERROR_CODE.NOT_FOUND]: {
    statusCode: http.StatusCode.NOT_FOUND,
    message: 'Not Found',
    code: http.StatusCode.NOT_FOUND
  },
  [ERROR_CODE.INTERNAL_ERROR]: {
    statusCode: http.StatusCode.INTERNAL_SERVER_ERROR,
    message: 'Internal Error',
    code: http.StatusCode.INTERNAL_SERVER_ERROR
  },
  [ERROR_CODE.INVALID_REQUEST]: {
    statusCode: http.StatusCode.BAD_REQUEST,
    message: 'Request format incorrect',
    code: http.StatusCode.BAD_REQUEST
  },
  [ERROR_CODE.INVALID_FIELD]: {
    statusCode: http.StatusCode.BAD_REQUEST,
    message: 'This field does not have the correct format.',
    code: http.StatusCode.BAD_REQUEST
  },
  [ERROR_CODE.KAFKA_UNEXPECTED_ERROR]: {
    statusCode: http.StatusCode.INTERNAL_SERVER_ERROR,
    message: 'Kafka Unexpected error initialized',
    code: http.StatusCode.INTERNAL_SERVER_ERROR
  },
  [ERROR_CODE.FIELD_REQUIRED]: {
    statusCode: http.StatusCode.BAD_REQUEST,
    message: 'This field is required.',
    code: 50003
  },
  [ERROR_CODE.DUPLICATED_KEY]: {
    statusCode: http.StatusCode.BAD_REQUEST,
    message: 'Key Mongo Id is Duplicated',
    code: 50001
  },
  // Details Errors
  [ERROR_CODE.DELIVERY_NOT_FOUND]: {
    statusCode: http.StatusCode.NOT_FOUND,
    message: 'Delivery Order could not be founded.',
    code: 50101
  },
  [ERROR_CODE.ORDER_NOT_FOUND]: {
    statusCode: http.StatusCode.NOT_FOUND,
    message: 'Order not found.',
    code: 50102
  },

  [ERROR_CODE.INVALID_STATE]: {
    statusCode: http.StatusCode.BAD_REQUEST,
    message: 'Entity has an invalid status',
    code: 50103
  },
  [ERROR_CODE.SERVICE_NOT_AVAILABLE_IN_ZONE]: {
    statusCode: http.StatusCode.NOT_FOUND,
    message: 'Service not available in zone',
    code: 50104
  },
  [ERROR_CODE.CITY_CODE_INVALID]: {
    statusCode: http.StatusCode.BAD_REQUEST,
    message: 'City must be in 63 provinces of VN',
    code: 50105
  },
  [ERROR_CODE.ORDER_DISTANCE_TOO_FAR]: {
    statusCode: http.StatusCode.BAD_REQUEST,
    message: `Delivery distance too far. Maximum for support is ${config
      .delivery?.dispatchRules?.deliveryDistanceNotSupport || 5} km!`,
    code: 50106
  },
  [ERROR_CODE.ORDER_DATA_INVALID]: {
    statusCode: http.StatusCode.BAD_REQUEST,
    message: 'Delivery Order data invalid',
    code: 50107
  },
  [ERROR_CODE.HAVE_NO_UPDATED]: {
    statusCode: http.StatusCode.BAD_REQUEST,
    message: 'Have no update was made',
    code: http.StatusCode.BAD_REQUEST
  }
};

const errorTranslator = (error: any): any => {
  // handle MongoDB error
  if (
    error.name === MONGO_ERROR &&
    error.code === MONGO_ERROR_CODE.DUPLICATED_KEY
  ) {
    logger.error('Mongo error', error);

    let errorList: ErrorDetails[] = [];
    Object.keys((error as any).keyValue).forEach(key => {
      errorList.push(createErrorDetail(key, ERROR_CODE.DUPLICATED_KEY));
    });
    throw new AppError(ERROR_CODE.INVALID_REQUEST, errorList);
  }
  throw error;
};

export {
  ERROR_CODE,
  ErrorList,
  JoiValidationErrors,
  MONGO_ERROR,
  MONGO_ERROR_CODE,
  errorTranslator
};
