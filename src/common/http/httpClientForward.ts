import { createHttpClient, HttpClient, RequestConfig } from '.';

import { Tracing, HttpHeaders } from '../constant';
import authTokenInterceptor from './authToken.interceptor';

const createHttpClientForward = (config: RequestConfig): HttpClient => {
  const httpClient: HttpClient = createHttpClient(config);

  httpClient.setRequestInterceptor(requestConfig => {
    return authTokenInterceptor(
      requestConfig,
      Tracing.TRACER_SESSION,
      HttpHeaders.AUTH
    );
  });

  return httpClient;
};

export default createHttpClientForward;
