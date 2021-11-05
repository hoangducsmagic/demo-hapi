import pino from 'hapi-pino';

const pinoOptions: pino.Options = {
  logPayload: true,
  logRequestStart: true,
  logRequestComplete: true
};

export default {
  plugin: pino,
  options: pinoOptions
};
