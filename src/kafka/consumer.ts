import { kafka } from './createTopics';

export const consumer = kafka.consumer({
  groupId: 'graphql-server'
});


