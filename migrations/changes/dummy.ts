// const { connection } = require('mongoose');
// const { connectMongo } = require('../../src/common/mongoDb');
const logger = require('../../src/logger').default;

exports.description = 'This is dummy migration';

exports.up = async (next: () => void) => {
  try {
    logger.info('Migrated Dummy Successfully');
    next();
  } catch (error) {
    logger.error('Cannot Migrated Dummy', error);
  }
};

exports.down = async (next: () => void) => {
  logger.debug('not support now');
  next();
};
