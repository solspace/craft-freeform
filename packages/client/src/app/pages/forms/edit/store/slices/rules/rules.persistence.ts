import type { SaveSubscriber } from '@editor/store/middleware/state-persist';
import { TOPIC_SAVE } from '@editor/store/middleware/state-persist';

const persist: SaveSubscriber = (_, data) => {
  const { state, persist } = data;

  const { fields, pages, notifications } = state.rules;

  persist.rules = {
    fields: fields.initialized ? fields.items : null,
    pages: pages.initialized ? pages.items : null,
    notifications: notifications.initialized ? notifications.items : null,
  };
};

PubSub.subscribe(TOPIC_SAVE, persist);
