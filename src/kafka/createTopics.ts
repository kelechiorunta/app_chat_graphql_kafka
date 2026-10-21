import { Kafka } from 'kafkajs';

export const kafka = new Kafka({
  clientId: 'graphql-server',
  brokers: ['localhost:9090']
});

export async function setupKafka() {
  const admin = kafka.admin();

  try {
    await admin.connect();

    const created = await admin.createTopics({
      waitForLeaders: true,
      topics: [
        {
          topic: 'chats',
          numPartitions: 1,
          replicationFactor: 1
        },
        {
          topic: 'customers',
          numPartitions: 1,
          replicationFactor: 1
        },
        {
          topic: 'details',
          numPartitions: 1,
          replicationFactor: 1
        },
        {
          topic: 'invoices',
          numPartitions: 1,
          replicationFactor: 1
        },
        {
          topic: 'tasks',
          numPartitions: 1,
          replicationFactor: 1
        }
      ]
    });

    console.log(created ? 'Kafka topics created.' : 'Kafka topics already exist.');
  } finally {
    await admin.disconnect();
  }
}

setupKafka();
