import config from '../../config';
import Redis from 'ioredis';

const redis = new Redis(config.redis.uri);

export default redis;
