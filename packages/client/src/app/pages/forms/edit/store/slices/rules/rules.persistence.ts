import type { SaveSubscriber } from '@editor/store/middleware/state-persist';
import { TOPIC_SAVE } from '@editor/store/middleware/state-persist';

const persist: SaveSubscriber = (_, data) => {
  const { state, persist } = data;

  const { fields, pages } = state.rules;

  persist.rules = {
    fields,
    pages,
  };
};

PubSub.subscribe(TOPIC_SAVE, persist);
