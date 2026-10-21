import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';

import app from "./app";
import schema from './graphql/schema';
import startKafkaConsumer from './kafka/startkafkaConsumer';

const server = createServer(app);
const PORT = 5500;

startKafkaConsumer();

// Upgrade the httpServer to persistent websocket transport layer on /graphql route
const wsServer = new WebSocketServer({
  server,
  path: '/graphql'
  // clientTracking: true
});

// Connect the ws server to schema subscription realtime event emission and response
// useServer({ schema }, wsServer);
useServer(
  {
    schema,

    onConnect(ctx: any) {
      console.log('WS Connected');
    },

    onSubscribe(ctx: any, msg: any) {
      console.log('CTX', ctx);
      console.log('Subscription:', msg.payload);
    },

    onNext(ctx: any, msg: any, args: any, result: any) {
      console.log('Next:', result);
    },

    onError(ctx: any, msg: any, errors: any) {
      console.error('Subscription Error:', errors);
    },

    onComplete() {
      console.log('Subscription completed');
    },

    onDisconnect() {
      console.log('WS disconnected');
    }
  },
  wsServer
);

wsServer.on('connection', () => {
  console.log('Raw websocket connected');
});
// // ✅ Initialize Redis once

server.listen(PORT, () => console.log(`Server is listening at PORT ${PORT}`))

export default server;

