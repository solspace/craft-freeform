import type { SaveSubscriber } from '@editor/store/middleware/state-persist';
import { TOPIC_SAVE } from '@editor/store/middleware/state-persist';

const persistIntegrations: SaveSubscriber = (_, data) => {
  const { state, persist } = data;

  persist.integrations = state.integrations.map((integration) => ({
    id: integration.id,
    enabled: Boolean(integration.enabled),
    values: integration.dirtyValues,
  }));
};

PubSub.subscribe(TOPIC_SAVE, persistIntegrations);
