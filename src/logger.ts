import { Tracing } from '../src/common/constant';
import { createLogger } from './common/logger';
import Logger from './common/logger';
import { name } from '../package.json';

const logger = createLogger({
  defaultMeta: {
    service: name
  },
  tracing: {
    tracerSessionName: Tracing.TRACER_SESSION,
    requestId: Tracing.TRANSACTION_ID
  }
});

export const wrapLogs = new Logger.BaseLogWrapper(logger).getWrapper();
export default logger;
