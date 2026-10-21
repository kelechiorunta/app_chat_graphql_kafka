// Start Kafka Consumer API for consuming messages from producers.
// The chatBus which is an extended event emitter joined with an asyncIterator

import { newChatBus } from "../chatbus";
import { consumer } from "./consumer";
import { producer } from "./producer";
import { Topics } from "./topics";

const controller = new AbortController();

producer
  .connect()
  .then(() => console.log('Kafka Producer connected'))
  .catch((err) => console.error(err instanceof Error ? err.message : err));

// emits the events for the graphql subscriber to listen for and yield.
const startKafkaConsumer = async () => {
  await consumer.connect();

  const topics = Object.values(Topics);
  for (const topic of topics) {
    await consumer.subscribe({
      topic,
      fromBeginning: true
    });
  }

  // Subscribe to all graphql subscribers based on the topic

  await consumer.run({
    eachMessage: async ({ topic, message }: { topic: any; message: any }) => {
      const payload = JSON.parse(message.value!.toString());

      // Emit/Publish the event and data from the payload with the chatBus based on the corresponding topic
   
      // Add a bit of debounce for the Chatbus emission
      setTimeout(() => {
        // Add abort signal to prevent memory leaks
        newChatBus.emit(payload.event, payload.data, { signal: controller.signal });
      }, 0);

      console.log(`${payload.event} emitted from ${topic} topic to graphql subscriber`);
      // Call the abort function once every emission
      controller.abort();
    }
  });
};

export default startKafkaConsumer;