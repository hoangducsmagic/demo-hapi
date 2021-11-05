import forwardAuthTokenInterceptor from '../authToken.interceptor';
import { getNamespace } from 'cls-hooked';

jest.mock('cls-hooked', () => ({
  getNamespace: jest.fn()
}));

describe('authTokenInterceptor', () => {
  it('should set authToken to authorization header', () => {
    const config = { headers: {} };
    const ns = 'a';
    const key = 'token';
    const authToken = 'authToken';
    const getSession = jest.fn(() => authToken);
    (getNamespace as jest.Mock).mockImplementationOnce(() => ({
      get: getSession
    }));
    const updatedConfig = forwardAuthTokenInterceptor(config, ns, key);

    expect(updatedConfig).toEqual({
      headers: {
        authorization: authToken
      }
    });
    expect(getNamespace).toHaveBeenCalledWith(ns);
    expect(getSession).toHaveBeenCalledWith(key);
  });
});
