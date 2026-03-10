import type { SaveSubscriber } from "@editor/store/middleware/state-persist";
import { TOPIC_SAVE } from "@editor/store/middleware/state-persist";

const persist: SaveSubscriber = (_, data) => {
  const { getState, persist } = data;

  const { layouts, fields, rows, pages } = getState().layout;

  persist.layout = {
    pages,
    layouts,
    rows,
    fields,
  };
};

PubSub.subscribe(TOPIC_SAVE, persist);
