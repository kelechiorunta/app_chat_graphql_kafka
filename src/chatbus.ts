import { EventEmitter } from 'events';

export class ChatBus<T = unknown> extends EventEmitter {
  asyncIterator(eventName: string): AsyncIterableIterator<T> {
    const ee = this;

    let listening = true;
    let listener: ((payload: T) => void) | undefined;

    return {
      next(): Promise<IteratorResult<T>> {
        if (!listening) {
          return this.return!();
        }

        return new Promise<IteratorResult<T>>((resolve) => {
          listener = (payload: T) => {
            ee.off(eventName, listener!);

            resolve({
              value: payload,
              done: false
            });
          };

          ee.on(eventName, listener);
        });
      },

      return(): Promise<IteratorResult<T>> {
        listening = false;

        if (listener) {
          ee.off(eventName, listener);
        }

        return Promise.resolve({
          value: undefined as any,
          done: true
        });
      },

      throw(error: unknown): Promise<IteratorResult<T>> {
        listening = false;

        if (listener) {
          ee.off(eventName, listener);
        }

        return Promise.reject(error);
      },

      [Symbol.asyncIterator]() {
        return this;
      }
    };
  }
}

export const newChatBus = new ChatBus();

// Declare an async generator
export async function* generator(EVENT: any) {
  const iterator = newChatBus.asyncIterator(EVENT);
  for await (const message of iterator) {
    yield message;
  }
}

// Declare registered events
export const EVENTS = {
  NEW_PRODUCT: 'NEW_PRODUCT'
};
//

export default ChatBus;