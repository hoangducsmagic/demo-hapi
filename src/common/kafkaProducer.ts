import { producer } from './kafka/index';
import config from '../config';
const kafKaConfig = {
  serviceName: config.serviceName,
  idempotent: false
};

const kproducer = producer.init(kafKaConfig);

export default kproducer;
