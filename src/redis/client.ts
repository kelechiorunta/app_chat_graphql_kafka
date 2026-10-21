import { getRedisClients } from "./redis";

const { pubClient, subClient } = getRedisClients();

let redisReady = false;
const connectPubSubClients = async() => {
  try {
	if (redisReady) {
    console.log(`⚡ Redis already connected in worker ${process.pid}, skipping...`);
    return;
  }
    // Only connect once (lazyConnect prevents double-connecting)
  await Promise.all([
  pubClient.connect().catch((err: any) => {
    if (err.message.includes('already connecting')) return;
    throw err;
  }),
  subClient.connect().catch((err: any) => {
    if (err.message.includes('already connecting')) return;
    throw err;
  })
]);
redisReady = true;
  } catch (error) {
    console.error(error instanceof Error? error.message : error)
  }
}

connectPubSubClients();

export { pubClient, subClient}