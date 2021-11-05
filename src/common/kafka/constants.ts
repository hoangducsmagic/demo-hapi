const CONFIG_MAP = {
  KAFKA: 'kafka',
  LOG_FILE: 'LOG_FILE',
  SERVICE_NAME: 'serviceName'
};

const GROUP_ID_IS_REQUIRED = 'Group Id is required';
const SERVICE_NAME_REQUIRED = 'Service name is required';
const CALLBACK_IS_NOT_A_FUNCTION = 'Callback is not a function';

const TRACING = {
  TRACER_SESSION: 'TRACER_SESSION',
  TRANSACTION_ID: 'x-request-id'
};

export {
  TRACING,
  CONFIG_MAP,
  SERVICE_NAME_REQUIRED,
  CALLBACK_IS_NOT_A_FUNCTION,
  GROUP_ID_IS_REQUIRED
};
