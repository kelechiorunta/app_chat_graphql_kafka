// kafka/historyConsumer.ts

import { consumer } from './consumer';

export async function startHistoryConsumer() {
  await consumer.connect();

  await consumer.subscribe({
    topic: 'products',
    fromBeginning: true
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const product = JSON.parse(message.value!.toString());

      console.log('History:', product);
    }
  });
  
}

//  startHistoryConsumer();
