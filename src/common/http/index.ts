import { RequestConfig, BasicAuth, Response, HttpError } from './http.model';
import { AxiosHttpClient, HttpClient } from './http.client';
import { Method, StatusCode } from './htttp.enums';
import { ResponseBase } from './HttpResponse';
import { IError } from '../error';
import authTokenInterceptor from './authToken.interceptor';
import createHttpClientForward from './httpClientForward';

export const createHttpClient = (config: RequestConfig): HttpClient => {
  return new AxiosHttpClient(config);
};

export { RequestConfig, Response, BasicAuth, HttpClient, HttpError };
export interface IHttpResponseBody<DataType, ErrorType> {
  data?: DataType;
  error?: IError<ErrorType>;
}

export default {
  Method,
  StatusCode,
  ResponseBase,
  authTokenInterceptor,
  createHttpClientForward
};
