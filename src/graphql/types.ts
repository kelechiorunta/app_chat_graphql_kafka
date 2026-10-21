import {
  GraphQLString,
  GraphQLObjectType,
  GraphQLID,
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLList
} from 'graphql';

export const ProductType = new GraphQLObjectType({
  name: 'Product',
  fields: {
    product_id: { type: GraphQLID },
    product_name: { type: GraphQLString },
    description: { type: GraphQLString },
    price: { type: GraphQLFloat },
    producer_name: { type: GraphQLString },
    category_name: { type: GraphQLString },
    image_url: { type: GraphQLString },
    rating: { type: GraphQLInt }
  }
});

export const ChatClient = new GraphQLObjectType({
	name: 'ChatClient',
	fields: {
		id: {type: GraphQLInt},
		client_id: {type: GraphQLString},
		name: {type: GraphQLString},
		email: {type: GraphQLString},
		address: {type: GraphQLString},
		avatar_url: {type: GraphQLString},
		phone: {type: GraphQLString},
		isOnline: {type: GraphQLBoolean},
		updated_at: {type: GraphQLString},
	}
})

export const TypingStatusType = new GraphQLObjectType({
  name: 'TypingStatus',
  fields: {
    senderId: { type: GraphQLString },
    receiverId: { type: GraphQLString },
    isTyping: { type: GraphQLBoolean }
  }
});

export const SenderType = new GraphQLObjectType({
  name: 'SenderType',
  fields: {
    senderId: { type: GraphQLString },
    receiverId: { type: GraphQLString },
  }
});

export const ChatType = new GraphQLObjectType({
	name: 'ChatType',
	fields: {
		chat_id: {type: GraphQLInt},
		senderId: {type: GraphQLString},
		receiverId: {type: GraphQLString},
		isRead: {type: GraphQLBoolean},
		chat_message: {type: GraphQLString},
		image_url: {type: GraphQLString},
		updated_at: {type: GraphQLString},
	}
})

export const CreateChatType = new GraphQLObjectType({
	name: 'CreateChatType',
	fields: {
		senderId: {type: GraphQLString},
		receiverId: {type: GraphQLString},
		chatMessage: {type: GraphQLString},
		isRead: {type: GraphQLBoolean},
	}
})

export const CreateProductType = new GraphQLObjectType({
  name: 'CreateProduct',
  fields: {
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    price: { type: GraphQLFloat },
    rating: { type: GraphQLInt },
    producer_id: { type: GraphQLString },
    category_id: { type: GraphQLString },
    image_url: { type: GraphQLString }
  }
});

export const CustomerType = new GraphQLObjectType({
  name: 'Customer',
  fields: {
    id: { type: GraphQLInt },
    client_id: { type: GraphQLString },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    address: { type: GraphQLString },
    avatar_url: { type: GraphQLString },
    isOnline: { type: GraphQLBoolean },
  }
});

export const CreateDetailsType = new GraphQLObjectType({
  name: 'Details',
  fields: {
    id: { type: GraphQLInt },
    fullName: { type: GraphQLString },
    email: { type: GraphQLString },
    firstAddress: { type: GraphQLString },
    secondAddress: { type: GraphQLString },
    city: { type: GraphQLString },
    postalCode: { type: GraphQLString },
    country: { type: GraphQLString }
  }
});

export const UserDetailsType = new GraphQLObjectType({
  name: 'UserDetails',
  fields: {
    id: { type: GraphQLInt },
    userId: { type: GraphQLInt },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    status: { type: GraphQLString },
    report: { type: GraphQLString }
  }
});

export const InvoiceType = new GraphQLObjectType({
  name: 'Invoice',
  fields: {
    id: { type: GraphQLInt },
    userId: { type: GraphQLInt },
    name: { type: GraphQLString },
    refId: { type: GraphQLString },
    ip: { type: GraphQLString },
    channel: { type: GraphQLString },
    currency: { type: GraphQLString },
    amount: { type: GraphQLInt },
    metadata: { type: GraphQLString },
    status: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString }
  }
});

export const CursorType = new GraphQLObjectType({
  name: 'CursorType',
  fields: {
    paginatedData: { type: new GraphQLList(UserDetailsType) },
    hasNextPage: { type: GraphQLBoolean },
    hasPreviousPage: { type: GraphQLBoolean },
    startCursor: { type: GraphQLInt },
    endCursor: { type: GraphQLInt },
    dataCount: { type: GraphQLInt }
  }
});

export const PaymentCursorType = new GraphQLObjectType({
  name: 'PaymentCursorType',
  fields: {
    paginatedData: { type: new GraphQLList(InvoiceType) },
    hasNextPage: { type: GraphQLBoolean },
    hasPreviousPage: { type: GraphQLBoolean },
    startCursor: { type: GraphQLInt },
    endCursor: { type: GraphQLInt },
    dataCount: { type: GraphQLInt }
  }
});

export const PendingTransactionType = new GraphQLObjectType({
  name: 'PendingTransaction',
  fields: {
    id: { type: GraphQLInt },
    userId: { type: GraphQLInt },
    name: { type: GraphQLString },
    amount: { type: GraphQLInt },
    type: { type: GraphQLString },
    status: { type: GraphQLString },
    progress: { type: GraphQLInt },
    scheduledAt: { type: GraphQLString },
    processedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString }
  }
});

export const DeleteTransactionType = new GraphQLObjectType({
  name: 'DeleteTransaction',
  fields: {
    success: { type: GraphQLBoolean }
  }
});

export const CategoryType = new GraphQLObjectType({
  name: 'Category',
  fields: {
    category_id: { type: GraphQLID },
    name: { type: GraphQLString }
  }
});

export const ProducerType = new GraphQLObjectType({
  name: 'Producer',
  fields: {
    producer_id: { type: GraphQLID },
    name: { type: GraphQLString }
  }
});

export const TransactionTaskType = new GraphQLObjectType({
  name: 'TransactionTask',
  fields: {
    id: { type: GraphQLInt },
    userId: { type: GraphQLInt },
    name: { type: GraphQLString },
    amount: { type: GraphQLInt },
    type: { type: GraphQLString },
    status: { type: GraphQLString },
    progress: { type: GraphQLInt },
    scheduledAt: { type: GraphQLString },
    processedAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString }
  }
});