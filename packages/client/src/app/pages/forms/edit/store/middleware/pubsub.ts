type Subscriber<T> = (message: string | symbol, data: T) => void;
type PubSub = {
  subscribe<T>(topic: string | symbol, subscriber: Subscriber<T>): () => void;
  publish<T>(topic: string | symbol, data: T): void;
  clearAllSubscriptions(): void;
};

const subscribers = new Map<string | symbol, Set<Subscriber<unknown>>>();

const PubSub: PubSub = {
  subscribe<T>(topic: string | symbol, subscriber: Subscriber<T>) {
    const topicSubscribers = ensureSubscribers(topic);
    const typedSubscriber = subscriber as Subscriber<unknown>;

    topicSubscribers.add(typedSubscriber);

    return () => {
      topicSubscribers.delete(typedSubscriber);

      if (topicSubscribers.size === 0) {
        subscribers.delete(topic);
      }
    };
  },

  publish<T>(topic: string | symbol, data: T) {
    const topicSubscribers = subscribers.get(topic);
    if (!topicSubscribers) {
      return;
    }

    topicSubscribers.forEach((subscriber) => {
      subscriber(topic, data);
    });
  },

  clearAllSubscriptions() {
    subscribers.clear();
  },
};

const ensureSubscribers = (
  topic: string | symbol,
): Set<Subscriber<unknown>> => {
  let topicSubscribers = subscribers.get(topic);
  if (!topicSubscribers) {
    topicSubscribers = new Set<Subscriber<unknown>>();
    subscribers.set(topic, topicSubscribers);
  }

  return topicSubscribers;
};

export default PubSub;
