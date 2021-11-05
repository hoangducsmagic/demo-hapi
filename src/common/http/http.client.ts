import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { stringify } from 'qs';

import { RequestConfig, Response, HttpError } from './http.model';
import { defaultTimeout } from './http.constant';

export interface HttpClient {
  request<T = any>(config: Partial<RequestConfig>): Promise<Response<T>>;
  setRequestInterceptor: (
    fn: (
      config: AxiosRequestConfig
    ) => AxiosRequestConfig | Promise<AxiosRequestConfig>
  ) => void;
  get<T = any>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<Response<T>>;
  delete<T = any>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<Response<T>>;
  post<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<Response<T>>;
  put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<Response<T>>;
  patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<Response<T>>;
}

const paramsSerializer = (params: any): string => {
  return stringify(params, {
    arrayFormat: 'repeat'
  });
};

export function generateAxiosInstance(apiConfig: RequestConfig): AxiosInstance {
  return axios.create({
    paramsSerializer,
    ...apiConfig
  });
}

export class AxiosHttpClient implements HttpClient {
  private apiConfig: RequestConfig;
  private axiosInstance: AxiosInstance;

  constructor(apiConfig: RequestConfig) {
    this.apiConfig = apiConfig;
    this.apiConfig.timeout = this.apiConfig.timeout || defaultTimeout;
    this.axiosInstance = generateAxiosInstance(this.apiConfig);
  }

  public mergeConfig(apiConfig: Partial<RequestConfig>): RequestConfig {
    return {
      ...this.apiConfig,
      ...apiConfig,
      headers: {
        ...apiConfig.headers
      }
    };
  }

  public setRequestInterceptor(
    fn: (
      config: AxiosRequestConfig
    ) => AxiosRequestConfig | Promise<AxiosRequestConfig>
  ) {
    this.axiosInstance.interceptors.request.use(fn);
  }

  public async request<T = any>(
    config: Partial<RequestConfig>
  ): Promise<Response<T>> {
    try {
      const mergedConfig = this.mergeConfig(config);
      const res: Response<T> = await this.axiosInstance.request(mergedConfig);

      return res;
    } catch (error) {
      // should handle error globally if the caller don't pass an error handler
      if (error.response) {
        throw new HttpError(error.response.status, error.response.data);
      }

      // client error, such as timeout
      throw error;
    }
  }

  public get<T = any>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<Response<T>> {
    const defaultConfig: Partial<RequestConfig> = {
      url,
      method: 'GET'
    };

    return this.request({
      ...defaultConfig,
      ...config
    });
  }

  public delete<T = any>(
    url: string,
    config?: Partial<RequestConfig>
  ): Promise<Response<T>> {
    const defaultConfig: Partial<RequestConfig> = {
      url,
      method: 'DELETE'
    };
    return this.request({
      ...defaultConfig,
      ...config
    });
  }

  public post<T = any>(
    url: string,
    data?: any,
    config?: Partial<RequestConfig>
  ): Promise<Response<T>> {
    const defaultConfig: Partial<RequestConfig> = {
      url,
      data,
      method: 'POST'
    };
    return this.request({
      ...defaultConfig,
      ...config
    });
  }

  public put<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<Response<T>> {
    const defaultConfig: Partial<RequestConfig> = {
      url,
      data,
      method: 'PUT'
    };
    return this.request({
      ...defaultConfig,
      ...config
    });
  }

  public patch<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig
  ): Promise<Response<T>> {
    const defaultConfig: Partial<RequestConfig> = {
      url,
      data,
      method: 'PATCH'
    };
    return this.request({
      ...defaultConfig,
      ...config
    });
  }
}
