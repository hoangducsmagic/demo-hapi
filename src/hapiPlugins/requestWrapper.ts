import { ResponseToolkit, Request, Plugin, Server } from '@hapi/hapi';
import { createNamespace } from 'cls-hooked';
import { HttpHeaders, Tracing } from '../common/constant';
import { initializeTracking } from '../tracking/tracking.service';

import { v4 } from 'uuid';
const session = createNamespace(Tracing.TRACER_SESSION);

const handleHapiRequest = async (
  hapiRequest: Request,
  hapiResponse: ResponseToolkit
) => {
  if (
    hapiRequest.headers['content-type'] &&
    hapiRequest.headers['content-type'].includes('application/json')
  ) {
    hapiRequest.headers['content-type'] = 'application/json';
  }
  // HapiSwagger only pick 'x-forwarded-host' header and ignore port so need this fix
  // ../../node_modules/hapi-swagger/lib/builder.js - internals.getHost()
  const xForwardedHost = hapiRequest.headers['x-forwarded-host'] || null;
  const xForwardedPort = hapiRequest.headers['x-forwarded-port'] || null;
  const xReferer = hapiRequest.headers['referer'] || null;
  if (xForwardedHost && xForwardedHost.indexOf(':') < 0 && xForwardedPort) {
    hapiRequest.headers[
      'x-forwarded-host'
    ] = `${xForwardedHost}:${xForwardedPort}`;
  }
  if (xReferer && xReferer.startsWith('https://')) {
    hapiRequest.headers['x-forwarded-proto'] = 'https';
  }
  if (
    !hapiRequest.headers['x-language'] ||
    hapiRequest.headers['x-language'] === 'vn'
  ) {
    hapiRequest.headers['x-language'] = 'vi';
  }
  if (!hapiRequest.headers['x-currency']) {
    hapiRequest.headers['x-currency'] = 'VND';
  }
  // TODO x-currency ISO 639 1codes
  const transactionId = hapiRequest.headers[Tracing.TRANSACTION_ID] || v4();
  const authToken = hapiRequest.headers[HttpHeaders.AUTH];
  session.bindEmitter(hapiRequest.raw.req);
  session.bindEmitter(hapiRequest.raw.res);

  const clsCtx = session.createContext();
  session.enter(clsCtx);
  // @ts-ignore
  hapiRequest.app[Tracing.TRACER_SESSION] = {
    context: clsCtx
  };
  // @ts-ignore
  hapiRequest.app[Tracing.REQUEST_ID] = transactionId;

  session.set(Tracing.TRANSACTION_ID, transactionId);
  session.set(HttpHeaders.AUTH, authToken);
  initializeTracking(hapiRequest);
  return hapiResponse.continue;
};

const requestWrapper: Plugin<{}> = {
  name: 'requestWrapper',
  version: '1.0.0',
  register: (server: Server) => {
    server.ext('onRequest', handleHapiRequest);
  },
  once: true
};

export default requestWrapper;
