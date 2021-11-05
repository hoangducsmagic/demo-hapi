import { AxiosRequestConfig } from 'axios';
import { getNamespace } from 'cls-hooked';

const authTokenInterceptor = (
  config: AxiosRequestConfig,
  namespace: string,
  key: string
) => {
  const session = getNamespace(namespace);
  const authToken = session && session.get(key);
  if (authToken) {
    config.headers['authorization'] = authToken;
  }
  return config;
};

export default authTokenInterceptor;
