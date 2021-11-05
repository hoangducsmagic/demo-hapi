import WinstonLogger from './WinstonLogger';
import { InitOptions, Logger, LevelEnum } from './logger.interface';
import { createEventLogStream } from './eventStream';
import BaseLogWrapper from './BaseLoggerWrapper';
// expose classes
export { createEventLogStream };

// expose methods
export const createLogger = (options: InitOptions): Logger => {
  return new WinstonLogger(options);
};

// expose types
export { InitOptions, Logger, LevelEnum };

export default { BaseLogWrapper };
