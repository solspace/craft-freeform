import type { SaveSubscriber } from "@editor/store/middleware/state-persist";
import { TOPIC_SAVE } from "@editor/store/middleware/state-persist";

const persistTranslations: SaveSubscriber = (_, data) => {
  const { getState, persist } = data;

  persist.translations = getState().translations;
};

PubSub.subscribe(TOPIC_SAVE, persistTranslations);
