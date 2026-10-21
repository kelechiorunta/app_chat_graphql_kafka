import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLFloat,
  GraphQLInt,
  GraphQLID,
  GraphQLBoolean,
  GraphQLInputObjectType
} from 'graphql';
import {
  CategoryType,
  ChatClient,
  ChatType,
  CreateChatType,
  CreateDetailsType,
  CreateProductType,
  CursorType,
  CustomerType,
  DeleteTransactionType,
  InvoiceType,
  PaymentCursorType,
  PendingTransactionType,
  ProducerType,
  ProductType,
  SenderType,
  TransactionTaskType,
  TypingStatusType,
  UserDetailsType
} from './types'

import type { Request } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { producer } from '../kafka/producer';
import { newChatBus } from '../chatbus';
import path from 'path';
import { pubClient, subClient } from '../redis/client';
// import { getRedisClients } from '../redis/redis';

/**
 * Construct a GraphQL schema and define the necessary resolvers.
 *
 */
dotenv.config({
	path: path.resolve(__dirname, '../../.env')
});
// redisClient.connect().catch((err) => console.log(err instanceof Error ? err.message : err));

export type Customer = {
  customer_id: number;
  username: string;
  email: string;
};

export type DetailsType = {
  customer_delivery_details_id: number;
  full_name: string;
  email: string;
  first_address: string;
  second_address: string;
  city: string;
  postal_code: string;
  country: string;
  created_at: string;
  updated_at: string;
};

export type InvoicesType = {
  payment_invoice_id: number;
  customer_id: number;
  reference_id: string;
  amount: number;
  channel: string;
  currency: string;
  metadata: string;
  ip_address: string;
  status: string;
  created_at: string;
  updated_at: string;
};

// ✅ Redis-based online users key
const ONLINE_USERS_KEY = 'online_users';

// Query
export const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    hello: {
      type: GraphQLString,
      resolve: () => 'world'
    },

    loginUser: {
      type: CustomerType,
      args: {
        id: { type: GraphQLString }
      },
      resolve: async (_: any, {id}, { req }: { req: Request }) => {
        try {
          if (!id) {
            throw Error('Please provide valid client id')
          }
          const response = await axios.get(`http://localhost:5467/auth/login/user/${id}`, {
            withCredentials: true, 
            headers: {
              Cookie: req.headers.cookie
            }
          });
          console.table(req.headers.cookie)
          const user = response.data.user;//response.data;
          const authenticatedUser = user;
          console.log("User", authenticatedUser)

          // await pubsub.publish('AUTHUSER', { loggedInUser: authenticatedUser });
          if (authenticatedUser) {
            await pubClient.hset(ONLINE_USERS_KEY, `${user.client_id}`, JSON.stringify(user))
            await producer.send({
              topic: 'customers',
              messages: [
                {
                  value: JSON.stringify({ event: 'NEW_CUSTOMER', data: authenticatedUser })
                }
              ]
            });
          }

          return authenticatedUser ? authenticatedUser : null;
        } catch (error) {
          console.error(error instanceof Error ? error.message : error);
        }
      }
    },

  logoutUser: {
    type: CustomerType,
    args: {
      id: { type: GraphQLString }
    },
    resolve: async (_: any, {id}, { req }: { req: Request }) => {
      try {
        if (!id) {
          throw Error('Please provide valid client id')
        }
        console.log('LOggedOutUserID', id)
        const response = await axios.get(`http://localhost:5467/auth/logout/user/${id}`, {
          withCredentials: true, 
          headers: {
            Cookie: req.headers.cookie
          }
        });
        console.table(req.headers.cookie)
        const user = response.data.user;//response.data;
        const loggedOutUser = user;
        console.log("User", loggedOutUser)
        // const getUser = await pubClient.hget(ONLINE_USERS_KEY,'695e22dd9cbcafd1fa51dfdd');
        // console.log('GETUSER', getUser)
        // console.info(getUser)
        // console.table(JSON.parse(getUser as any))
        // await pubsub.publish('AUTHUSER', { loggedInUser:authenticatedUser });
        if (loggedOutUser) {
          await pubClient.del(ONLINE_USERS_KEY, `${user.client_id}`, JSON.stringify(user))
          await producer.send({
            topic: 'customers',
            messages: [
              {
                value: JSON.stringify({ event: 'NEW_CUSTOMER', data:loggedOutUser })
              }
            ]
          });
        }
        return loggedOutUser ? loggedOutUser : null;
      } catch (error) {
        console.error(error instanceof Error ? error.message : error);
      }
    }
  },

	getChatClients: {
		type: new GraphQLList(ChatClient),
		args: {id: {type: GraphQLString}},
		resolve: async(_: any, { id }, {req}) => {
			try {
				if (!id) {
					throw new Error("Please provide id credential")
				}
				console.log("ID", id);
				const response = await axios.get(`http://localhost:5467/auth/clients/${id}`, {
					withCredentials: true,
					headers: {
						Cookie: req.headers.cookie
					}
				});
				const clients = response.data.clients;
        const allOnline = await pubClient.hkeys(ONLINE_USERS_KEY);
        console.log("ONLINEUSERS")
        console.table(allOnline);
				// console.table(clients)
				return clients? clients : []

			} catch (error) {
				console.error(error instanceof Error? error.message : error)
			}
		}
	},

	getChats: {
		type: new GraphQLList(ChatType),
		args: {
			senderId: {type: GraphQLString},
			receiverId: {type: GraphQLString},
		},
		resolve: async(_: any, { senderId, receiverId }, {req}) => {
			try {
				if (!senderId || !receiverId) {
					throw new Error("Please provide id credential")
				}
				
				const response = await axios.get(`http://localhost:5467/chat/${senderId}/${receiverId}`, {
					withCredentials: true,
					headers: {
						Cookie: req.headers.cookie
					}
				});
				const chats = response.data.chats;
        if (chats) {
          // await producer.send({
          //   topic: 'customers',
          //   messages: [
          //     {
          //       value: JSON.stringify({ event: 'SENDER_ID', data: senderId})
          //     }
          //   ]
          // });
        }
				return chats? chats : []

			} catch (error) {
				console.error(error instanceof Error? error.message : error)
			}
		}
	},

  getProducts: {
    type: new GraphQLList(ProductType),
    resolve: async (_: any, __: any) => {
      try {
        const products = await axios.get('http://localhost:3980/apiproducts');
        return products ? products.data : [];
      } catch (error) {
        console.error(error instanceof Error ? error.message : error);
      }
    }
  },

  getCategories: {
    type: new GraphQLList(CategoryType),
    resolve: async (_: any, __: any) => {
      try {
        const categories = await axios.get('http://localhost:3980/apicategories');
        return categories ? categories.data : [];
      } catch (error) {
        console.error(error instanceof Error ? error.message : error);
      }
    }
  },
  getProducers: {
    type: new GraphQLList(ProducerType),
    resolve: async (_: any, __: any) => {
      try {
        const producers = await axios.get('http://localhost:3980/apiproducers');
        return producers ? producers.data : [];
      } catch (error) {
        console.error(error instanceof Error ? error.message : error);
      }
    }
  },
  getDetails: {
    type: CursorType,
    args: {
      id: { type: GraphQLInt },
      cursor: { type: GraphQLInt },
      limit: { type: GraphQLInt },
      direction: { type: GraphQLString },
      offset: { type: GraphQLInt }
    },
    resolve: async (_, { id, cursor, limit, direction, offset }, { req }: {req: Request }) => {
      try {
        if (!id) {
          throw Error("Please provide the customer's id.");
        }
        const details = await axios.get(
          `http://localhost:3980/api/customers/details/${Number(id)}cursor=${cursor}&limit=${Number(limit)}&direction=${direction}offset=${Number(offset)}`,
          {
            withCredentials: true,
            headers: {
              Cookie: req.headers.cookie
            }
          }
        );
        // console.table(details.data);
        return details ? details.data : [];
      } catch (error) {
        console.error(error instanceof Error ? error.message : error);
      }
    }
  },
  getInvoices: {
    type: PaymentCursorType,
    args: {
      id: { type: GraphQLInt },
      cursor: { type: GraphQLInt },
      limit: { type: GraphQLInt },
      direction: { type: GraphQLString },
      offset: { type: GraphQLInt }
    },
    resolve: async (_, { id, cursor, limit, direction, offset }, { req }: {req: Request }) => {
      try {
        if (!id) {
          throw Error("Please provide the customer's id.");
        }
        const details = await axios.get(
          `http://localhost:3980/api/paystack/invoices/${Number(id)}cursor=${cursor}&limit=${Number(limit)}&direction=${direction}offset=${Number(offset)}`,
          {
            withCredentials: true,
            headers: {
              Cookie: req.headers.cookie
            }
          }
        );
        // console.table(details.data);
        return details ? details.data : [];
      } catch (error) {
        console.error(error instanceof Error ? error.message : error);
      }
    }
  },
  getUserTransactionTasks: {
    type: new GraphQLList(TransactionTaskType),
    args: {
      id: { type: GraphQLInt },
      pending: { type: GraphQLBoolean }
    },
    resolve: async (_, { id, pending = false }, { req }: { req: Request })=> {
      try {
        if (!id) {
          throw Error("Please provide the customer's id.");
        }
        const tasks = await axios.get(
          `http://localhost:3980/api/scheduler/${Number(id)}?pending={pending}`,
          {
            withCredentials: true,
            headers: {
              Cookie: req.headers.cookie
            }
          }
        );
        // console.table(details.data);
        return tasks ? tasks.data.allTasks : [];
      } catch (error) {
        console.error(error instanceof Error ? error.message : error);
      }
    }
  }
}
});

// Mutation
export const MutationType = new GraphQLObjectType({
  name: 'Mutation',
  fields: {

    sendTypingStatus: {
      type: TypingStatusType,
      args: {
        senderId: { type: GraphQLString },
        receiverId: { type: GraphQLString },
        isTyping: { type: GraphQLBoolean }
      },
      resolve: async (parent, { senderId, receiverId, isTyping }, context) => {
        try {
          const typingIndicator = { senderId: senderId, receiverId: receiverId, isTyping };
          // console.log('EMITTING TYPING:', typingIndicator);

          // setTimeout(() => {
          //   newChatBus.emit('TYPING', { sendTypingNotifications: typingIndicator });
          // }, 0);

          await producer.send({
            topic: 'chats',
            messages: [
              {
                value: JSON.stringify({ event: 'TYPING', data: typingIndicator })
              }
            ]
          });

          return typingIndicator;
        } catch (error) {
          console.error(error instanceof Error ? error.message : error);
        }
      }
    },

  updateChatIsReadStatus: {
	  type: ChatType,
	  args: {
		chatId: { type: GraphQLString },
		status: { type: GraphQLBoolean },
	  },
	  resolve: async(_: any, { chatId, status}, {req} ) => {
		try {
			if (!chatId) {
				throw Error('Please provide senderId and receiverIds')
			}

      // console.log("isRead", isRead);
      console.table({chatId, status});

			const response = await axios.put(
				`http://localhost:5467/chat`,
				{
					chatId,
          status
				},
				{
					withCredentials: true, 
					headers: {
						Cookie: req.headers.cookie
					}
				}
			);
			const chat = response.data.updatedChat;
      console.table(chat)
			if (chat) {
				// await producer.send({
				// 	topic: 'chats',
				// 	messages: [
				// 		{
				// 			value: JSON.stringify({ event: 'NEW_CHAT_MESSAGE', data: chat })
				// 		}
				// 	]
				// });
        // // await producer.send({
        // //   topic: 'customers',
        // //   messages: [
        // //     {
        // //       value: JSON.stringify({ event: 'SENDER_ID', data: {senderId: senderId, receiverId: receiverId}})
        // //     }
        // //   ]
        // // });
				return chat? chat : null;
			}
			
		} catch (error) {
			console.error(error instanceof Error? error.message: error)
			
		}
	  }	
	},

	createChat: {
	  type: ChatType,
	  args: {
		senderId: { type: GraphQLString },
		receiverId: { type: GraphQLString },
		chatMessage: { type: GraphQLString },
		imageUrl: { type: GraphQLString },
		isRead: { type: GraphQLBoolean },
	  },
	  resolve: async(_: any, {senderId, receiverId, isRead, chatMessage, imageUrl}, {req} ) => {
		try {
			if (!senderId || !receiverId) {
				throw Error('Please provide senderId and receiverIds')
			}

      console.log("isRead", isRead);
      console.table({senderId, receiverId});

			const response = await axios.post(
				`http://localhost:5467/chat`,
				{
					senderId,
					receiverId,
					chatMessage,
					isRead,
					imageUrl
				},
				{
					withCredentials: true, 
					headers: {
						Cookie: req.headers.cookie
					}
				}
			);
			const chat = response.data.newChat;
			if (chat) {
				await producer.send({
					topic: 'chats',
					messages: [
						{
							value: JSON.stringify({ event: 'NEW_CHAT_MESSAGE', data: chat })
						}
					]
				});
        await producer.send({
          topic: 'customers',
          messages: [
            {
              value: JSON.stringify({ event: 'SENDER_ID', data: {senderId: senderId, receiverId: receiverId}})
            }
          ]
        });
				return chat? chat : null;
			}
			
		} catch (error) {
			console.error(error instanceof Error? error.message: error)
			
		}
	  }	
	},
    createProduct: {
      type: CreateProductType,
      args: {
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLFloat },
        rating: { type: GraphQLInt },
        category_id: { type: GraphQLInt },
        producer_id: { type: GraphQLInt },
        image_url: { type: GraphQLString }
      },
      resolve: async (
        _,
        { name, description, price, rating, category_id, producer_id, image_url },
        { req }: { req: Request }
      ) => {
        try {
          console.table({ name, description, price, category_id, producer_id, rating, image_url });
          if (
            !name ||
            !description ||
            !price ||
            !rating ||
            !category_id ||
            !producer_id ||
            !image_url
          ) {
            throw Error('Product fields are incomplete');
          }
          const response = await axios.post(
            'http://localhost:3980/api/products/create',
            {
              name: name,
              description: description,
              price: price,
              rating: rating,
              category_id: category_id,
              producer_id: producer_id,
              image_url: image_url
            },
            {
              withCredentials: true,
              headers: {
                Cookie: req.headers.cookie
              }
            }
          );

          const data = await response.data;
          const product = data.product;
          // Producer queues messages for the kafka topics, and prepares them for publish with the consumer

          // Validate product saved or created before publishing event
          if (product) {
            await producer.send({
              topic: 'products',
              messages: [
                {
                  value: JSON.stringify({ event: 'NEW_PRODUCT', data: product })
                }
              ]
            });
          }

          return product ? product : null;
        } catch (error) {
          console.error(error instanceof Error ? error.message : error);
          return error;
        }
      }
    },

    createInvoice: {
      type: InvoiceType,
      args: {
        id: { type: GraphQLInt },
        email: { type: GraphQLString },
        amount: { type: GraphQLInt },
        authCode: { type: GraphQLString },
      },
      resolve: async (_, { id, email, amount, authCode }, { req }) => {
        try {
          if (!id) {
            throw Error("Please provide valid customer's id");
          }
          if (!email || !amount || !authCode) {
            throw Error('Please provide sufficient details for task creation');
          }

          console.table({id, email, amount, authCode });

          const response = await axios.post(
            `http://localhost:3980/api/paystack/initialize`,
            {
              id: Number(id),
              email,
              amount: Number(amount),
              authCode,
            },
            {
              withCredentials: true,
              headers: {
                Cookie: req.headers.cookie
              }
            }
          );
          const invoice = await response.data.data;
          console.table(invoice);
          return invoice ? invoice : null;
        } catch (error) {
          console.error(error instanceof Error ? error.message : error);
        }
      }
    },

    createScheduledTask: {
      type: TransactionTaskType,
      args: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        amount: { type: GraphQLInt },
        type: { type: GraphQLString },
        scheduledAt: { type: GraphQLString }
      },
      resolve: async (_, { id, name, amount, type, scheduledAt }, { req }) => {
        try {
          if (!id) {
            throw Error("Please provide valid customer's id");
          }
          if (!name || !type || !scheduledAt) {
            throw Error('Please provide sufficient details for task creation');
          }

          const response = await axios.post(
            `http://localhost:3980/api/scheduler`,
            {
              id: Number(id),
              name,
              amount: Number(amount),
              type,
              scheduledAt
            },
            {
              withCredentials: true,
              headers: {
                Cookie: req.headers.cookie
              }
            }
          );
          const task = await response.data.task;
          console.table(task);
          return task ? task : [];
        } catch (error) {
          console.error(error instanceof Error ? error.message : error);
        }
      }
    },

    updateScheduledTask: {
      type: TransactionTaskType,
      args: {
        id: { type: GraphQLInt },
        userId: { type: GraphQLInt },
        status: { type: GraphQLString },
        progress: { type: GraphQLInt },
        processedAt: { type: GraphQLString },
        scheduledAt: { type: GraphQLString }
      },
      resolve: async (_, { id, userId, status, progress, processedAt, scheduledAt }, { req }) => {
        try {
          if (!id && !userId) {
            throw Error("Please provide valid customer's id");
          }
          if (!status || !progress || !processedAt) {
            throw Error('Please provide sufficient details for task creation');
          }

          const response = await axios.put(
            `http://localhost:3980/api/scheduler`,
            {
              id: Number(id),
              userId: Number(userId),
              status,
              progress: Number(progress),
              processedAt,
              scheduledAt
            },
            {
              withCredentials: true,
              headers: {
                Cookie: req.headers.cookie
              }
            }
          );
          const task = await response.data.task;
          console.table(task);
          return task ? task : [];
        } catch (error) {
          console.error(error instanceof Error ? error.message : error);
        }
      }
    },

    deleteScheduledTask: {
      type: DeleteTransactionType,
      args: {
        id: { type: GraphQLInt }
      },
      resolve: async (_, { id }, { req }) => {
        try {
          await axios.delete(`http://localhost:3980/api/scheduler/${Number(id)}`, {
            withCredentials: true,
            headers: {
              Cookie: req.headers.cookie
            }
          });
          return {success: true};
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : error;
          console.error(errorMsg);
        }
      }
    },

    editCustomer: {
      type: CustomerType,
      args: {
        _id: { type: GraphQLInt },
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        confirmPassword: { type: GraphQLString },
        phone: { type: GraphQLString },
        address: { type: GraphQLString }
      },
      resolve: async (
        _: any,
        { _id, username, email, password, confirmPassword, address, phone },
        { req }
      ) => {
        try {
          if (!_id) {
            throw Error("Please provide the customer's id.");
          }
          if (!username || !email || !password || !confirmPassword || !phone || !address) {
            throw Error('Incomplete fields');
          }

          const response = await axios.put(
            `http://localhost:3980/api/customers/${Number(_id)}`,
            {
              username,
              email,
              password,
              confirmPassword,
              phone,
              address
            },
            {
              withCredentials: true,
              headers: {
                Cookie: req.headers.cookie
              }
            }
          );
          const customer = await response.data;

          // Validate customer has been modified before publishing event
          if (customer) {
            await producer.send({
              topic: 'customers',
              messages: [
                {
                  value: JSON.stringify({ event: 'EDIT_CUSTOMER', data: customer })
                }
              ]
            });
          }

          return customer ? customer : null;
        } catch (err) {
          console.error(err instanceof Error ? err.message : err);
        }
      }
    },

    createDetail: {
      type: CreateDetailsType,
      args: {
        id: { type: GraphQLInt },
        fullName: { type: GraphQLString },
        email: { type: GraphQLString },
        firstAddress: { type: GraphQLString },
        secondAddress: { type: GraphQLString },
        city: { type: GraphQLString },
        postalCode: { type: GraphQLString },
        country: { type: GraphQLString }
      },
      resolve: async (
        _,
        { id, fullName, email, firstAddress, secondAddress, city, postalCode, country },
        { req }: { req: Request }
      ) => {
        try {
          console.table({
            id,
            fullName,
            email,
            firstAddress,
            secondAddress,
            city,
            postalCode,
            country
          });
          if (
            !id ||
            !fullName ||
            !email ||
            !firstAddress ||
            !secondAddress ||
            !city ||
            !postalCode ||
            !country
          ) {
            throw Error('Detail fields are incomplete');
          }
          const response = await axios.post(
            'http://localhost:3980/api/customers/details',
            {
              id: id,
              fullName: fullName,
              email: email,
              firstAddress: firstAddress,
              secondAddress: secondAddress,
              city: city,
              postalCode: postalCode,
              country: country
            },
            {
              withCredentials: true,
              headers: {
                Cookie: req.headers.cookie
              }
            }
          );

          const data = await response.data;
          const details = data.details;
          console.log(data);
          // Producer queues messages for the kafka topics, and prepares them for publish with the consumer

          // Validate product saved or created before publishing event
          if (details) {
            await producer.send({
              topic: 'details',
              messages: [
                {
                  value: JSON.stringify({ event: 'NEW_DETAIL', data: details })
                }
              ]
            });
          }

          return details ? details : null;
        } catch (error) {
          console.error(error instanceof Error ? error.message : error);
          return error;
        }
      }
    }
  }
});

export const SubscriptionType = new GraphQLObjectType({
  name: 'Subscription',
  fields: {
    newProductSubscription: {
      type: CreateProductType,

      subscribe: async function* (parent, args, content) {
        console.log('GraphQL client subscribed');
        const productAsyncIterator = newChatBus.asyncIterator('NEW_PRODUCT');
        for await (const product of productAsyncIterator) {
          console.log('PRODUCT', product);
          yield {
            newProductSubscription: product
          };
        }
      },

      resolve: (payload) => payload.newProductSubscription
    },

    sendTypingNotifications: {
      type: TypingStatusType,
      subscribe: async function* (parent, args, context) {
        const typingAsyncIterator = newChatBus.asyncIterator('TYPING');
        for await (const typingIndicator of typingAsyncIterator) {
          // console.log('SUBSCRIBE TYPING:', typingIndicator);
          // console.log('TYPING INDICATION', typingIndicator);
          yield {
            sendTypingNotifications: typingIndicator
          };
        }
      },
      resolve: (payload) => payload.sendTypingNotifications
    },

	newChatMessageSubscription: {
      type: ChatType,

      subscribe: async function* (parent, args, content) {
        console.log('GraphQL client subscribed');
        const chatMessageAsyncIterator = newChatBus.asyncIterator('NEW_CHAT_MESSAGE');
        for await (const chat of chatMessageAsyncIterator) {
          console.log('NEWCHAT', chat);
          console.table(chat)
          yield {
            newChatMessageSubscription: chat
          };
        }
      },

      resolve: (payload) => payload.newChatMessageSubscription
    },

    loggedInUser: {
      type: CustomerType,
      // subscribe: () => {
      //   return pubsub.asyncIterableIterator('AUTHUSER');
      // },
      subscribe: async function* (parent, args, context) {
        console.log('CONTEXT', context);
        console.log('GraphQL client subscribed');

        const customerAsyncIterator = newChatBus.asyncIterator('NEW_CUSTOMER');
        for await (const customer of customerAsyncIterator) {
          console.log('CUSTOMER', customer);
          // if (authenticatedUser.username === (customer as Customer)?.username) {
          yield {
            loggedInUser: customer
          };
        }
      },
      resolve: (payload, args, context) => payload.loggedInUser
    },

    sender: {
      type: SenderType,
      // subscribe: () => {
      //   return pubsub.asyncIterableIterator('AUTHUSER');
      // },
      subscribe: async function* (parent, args, context) {
        console.log('CONTEXT', context);
        console.log('GraphQL client subscribed');

        const senderIdAsyncIterator = newChatBus.asyncIterator('SENDER_ID');
        for await (const ids of senderIdAsyncIterator) {
          console.log('SENDER_ID', ids);
          // if (authenticatedUser.username === (customer as Customer)?.username) {
          yield {
            sender: ids
          };
        }
      },
      resolve: (payload, args, context) => payload.sender
    },

    updatedCustomer: {
      type: CustomerType,

      subscribe: async function* (parent, args, context) {
        console.log('CONTEXT', context);
        console.log('GraphQL client subscribed');

        const customerAsyncIterator = newChatBus.asyncIterator('EDIT_CUSTOMER');
        for await (const customer of customerAsyncIterator) {
          console.log('CUSTOMER', customer);
          // if (authenticatedUser.username === (customer as Customer)?.username) {
          yield {
            updatedCustomer: customer
          };
        }
      },
      resolve: (payload, args, context) => payload.updatedCustomer
    },

    newDetail: {
      type: CreateDetailsType,
      // subscribe: () => {
      //   return pubsub.asyncIterableIterator('AUTHUSER');
      // },
      subscribe: async function* (parent, args, context) {
        console.log('CONTEXT', context);
        console.log('GraphQL client subscribed');

        const newDetailAsyncIterator = newChatBus.asyncIterator('NEW_DETAIL');
        for await (const detail of newDetailAsyncIterator) {
          console.log('NEW DETAIL', detail);
          const new_detail = {
            id: (detail as DetailsType).customer_delivery_details_id,
            fullName: (detail as DetailsType).full_name,
            email: (detail as DetailsType).email,
            firstAddress: (detail as DetailsType).first_address,
            secondAddress: (detail as DetailsType).second_address,
            city: (detail as DetailsType).city,
            postalCode: (detail as DetailsType).postal_code,
            country: (detail as DetailsType).country
          };
          // if (authenticatedUser.username === (customer as Customer)?.username) {
          yield {
            newDetail: new_detail
          };
        }
      },
      resolve: (payload, args, context) => payload.newDetail
    },

    newInvoice: {
      type: InvoiceType,
      // subscribe: () => {
      //   return pubsub.asyncIterableIterator('AUTHUSER');
      // },
      subscribe: async function* (parent, args, context) {
        console.log('CONTEXT', context);
        console.log('GraphQL client subscribed');

        const newInvoiceAsyncIterator = newChatBus.asyncIterator('NEW_INVOICE');
        for await (const invoice of newInvoiceAsyncIterator) {
          console.log('NEW INVOICE', invoice);
          const new_invoice = {
            id: (invoice as InvoicesType).payment_invoice_id,
            userId: (invoice as InvoicesType).customer_id,
            name: (invoice as InvoicesType).currency,
            refId: (invoice as InvoicesType).reference_id,
            ip: (invoice as InvoicesType).ip_address,
            channel: (invoice as InvoicesType).channel,
            currency: (invoice as InvoicesType).currency,
            amount: (invoice as InvoicesType).amount,
            metadata: (invoice as InvoicesType).metadata,
            status: (invoice as InvoicesType).status,
            createdAt: (invoice as InvoicesType).created_at,
            updatedAt: (invoice as InvoicesType).updated_at
          };
          // if (authenticatedUser.username === (customer as Customer)?.username) {
          yield {
            newInvoice: new_invoice
          };
        }
      },
      resolve: (payload, args, context) => payload.newInvoice
    },

    // Task graphql subscriber
    pendingTransaction: {
      type: PendingTransactionType,

      subscribe: async function* (parent, args, context) {
        const pendingTransactionAsyncIterator = newChatBus.asyncIterator('PENDING_TRANSACTION');
        for await (const transaction of pendingTransactionAsyncIterator) {
          console.log('Pending', transaction);
          yield {
            pendingTransaction: transaction
          };
        }
      },
      resolve: (payload, args, context) => payload.pendingTransaction
    }
  }
});

// Schema
const schema = new GraphQLSchema({
  query: QueryType,
  mutation: MutationType,
  subscription: SubscriptionType,
  types: [
    CustomerType,
    ProductType,
    CategoryType,
    ProducerType,
    CreateProductType,
	  ChatType,
    CreateDetailsType,
	  CreateChatType,
    UserDetailsType,
    CursorType,
    PaymentCursorType,
    InvoiceType,
    PendingTransactionType,
    TransactionTaskType,
    TypingStatusType,
    SenderType
  ]
});

export default schema;