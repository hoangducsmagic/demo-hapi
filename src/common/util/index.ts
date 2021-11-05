import { retry } from './retry';
const ASYNC_MATCHER_REGEX = /(__awaiter)+/i;

const isAsync = (wrapped: Function) =>
  Boolean(wrapped.toString().match(ASYNC_MATCHER_REGEX));

const getMongoUri = (
  user: string,
  password: string,
  dbName: string,
  hosts: string[]
): string => {
  const hostsString = hosts.join(',');
  let credential = '';
  if (user && password) {
    credential = `${user}:${password}@`;
  }
  return `mongodb://${credential}${hostsString}/${dbName}`;
};

const utils = {
  getMongoUri,
  isAsync,
  retry
};

export default utils;
