export const topicEventMap = {
  products: ['NEW_PRODUCT'],
  customers: ['NEW_CUSTOMER', 'EDIT_CUSTOMER'],
  orders: ['NEW_ORDER'],
  details: ['NEW_DETAIL'],
  reviews: ['NEW_REVIEW']
};

export type TopicEventMapType = {
  products: string[];
  customers: string[];
  orders: string[];
  details: string[];
  reviews: string[];
};
