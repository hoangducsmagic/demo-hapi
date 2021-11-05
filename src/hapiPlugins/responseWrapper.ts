import { Request, ResponseToolkit, Plugin, Server } from '@hapi/hapi';
import { getNamespace } from 'cls-hooked';

import logger from '../logger';
import { HttpResponse } from '../common/HttpResponse';
import { Tracing, HttpHeaders } from '../common/constant';
import { AppError } from '../common/error/AppError';

const documentPathRegex = /\/(documentation|swagger\.json|swaggerui\/(.*))$/;

const handleHapiResponse = (
  hapiRequest: Request,
  hapiResponse: ResponseToolkit
) => {
  // ignore document ui path
  if (documentPathRegex.test(hapiRequest.url.pathname))
    return hapiResponse.continue;
  const httpResponse = new HttpResponse<any>();
  let errorMessage = '',
    errorCode = '',
    errorDetails;
  const responseData = hapiResponse.request.response;
  if (responseData instanceof Error) {
    errorMessage = responseData.output.payload.message;
    errorCode = responseData.output.payload.error;
    // parse raw error not coming from server handler, ex: joi validation
    if (!responseData.isServer) {
      httpResponse.fail(
        {
          message: responseData.output.payload.message,
          code: responseData.output.payload.statusCode
        },
        responseData.output.statusCode
      );
    }

    logger.error(responseData.message, responseData);
    if (responseData instanceof AppError) {
      const errors = responseData.getErrors();
      errorMessage = errors.message;
      errorCode = responseData.errorCode.toString();
      errorDetails = errors.errors;
      httpResponse.fail(
        {
          message: errors.message,
          code: errors.code,
          errors: errors.errors
        },
        errors.statusCode
      );
    } else {
      httpResponse.fail(
        {
          message: responseData.output.payload.message,
          code: responseData.output.payload.statusCode
        },
        responseData.output.statusCode
      );
    }
  } else {
    httpResponse.success(responseData.source, responseData.statusCode);
  }
  let response = hapiResponse
    .response(httpResponse.getBody())
    .code(httpResponse.getStatusCode());
  // setting errorMessage & errorCode for logger with hapi-pino
  errorMessage && response.header(HttpHeaders.X_ERROR_MESSAGE, errorMessage);
  errorCode && response.header(HttpHeaders.X_ERROR_CODE, errorCode);
  errorDetails &&
    errorDetails.length &&
    response.header(HttpHeaders.X_ERROR_LIST, JSON.stringify(errorDetails));

  const tracerSession = getNamespace(Tracing.TRACER_SESSION);
  if (tracerSession) {
    const transactionId = tracerSession.get(Tracing.TRANSACTION_ID);
    response.header(Tracing.TRANSACTION_ID, transactionId);
  }
  return response;
};

const responseWrapper: Plugin<{}> = {
  name: 'responseWrapper',
  version: '1.0.0',
  register: (server: Server) => {
    server.ext('onPreResponse', handleHapiResponse);
  },
  once: true
};

export default responseWrapper;
