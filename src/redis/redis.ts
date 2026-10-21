// server/redisClient.js

import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import { createClient, RedisClient } from 'redis';

dotenv.config({
  path: path.resolve(__dirname, '../../.env')
});


let pubClient: Redis;
let subClient: Redis;

const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
	console.log("REDIS_URL", redisUrl)

export function getRedisClients() {
  if (!pubClient || !subClient) {
    const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;

    pubClient = new Redis(redisUrl as string, { lazyConnect: true });//createClient({url: redisUrl as string})
    subClient = new Redis(redisUrl as string, { lazyConnect: true })//pubClient.duplicate();

    pubClient.on('error', (err: any) =>
      console.error(`❌ Redis Pub error (worker ${process.pid}):`, err)
    );
    subClient.on('error', (err: any) =>
      console.error(`❌ Redis Sub error (worker ${process.pid}):`, err)
    );
  }

  return { pubClient, subClient };
}

// getRedisClients();