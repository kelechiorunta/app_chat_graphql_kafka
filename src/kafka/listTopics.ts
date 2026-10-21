import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'graphql-server',
  brokers: ['localhost:9092']
});

(async () => {
  const admin = kafka.admin();

  await admin.connect();

  console.log(await admin.listTopics());

  await admin.disconnect();
})();
