export interface ILogInstance {
  debug: Function;
  info: Function;
  error: Function;
  warn: Function;
}

interface LogMethod {
  (message: string, meta?: any): void; // TODO: define meta type
}

interface Logger {
  info: LogMethod;
  error: LogMethod;
  warn: LogMethod;
  debug: LogMethod;
  critical: LogMethod;
  onFinished(callback: () => void): void;
}
enum LevelEnum {
  critical = 'critical',
  error = 'error',
  warn = 'warn',
  info = 'info',
  debug = 'debug'
}

const customLevels = {
  levels: {
    critical: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4
  },
  colors: {
    critical: 'magenta',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue'
  }
};

interface Tracing {
  tracerSessionName: string;
  requestId: string;
}

interface InitOptions {
  tracing: Tracing;
  level?: LevelEnum;
  fileAppender?: boolean;
  defaultMeta?: Record<string, any>;
}

export type IMaskConfiguration = string[] | undefined;

export { Logger, LogMethod, InitOptions, LevelEnum, Tracing, customLevels };
