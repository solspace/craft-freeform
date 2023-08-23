import type {
  SaveSubscriber,
  UpdatedSubscriber,
} from '@editor/store/middleware/state-persist';
import {
  TOPIC_SAVE,
  TOPIC_UPSERTED,
} from '@editor/store/middleware/state-persist';

import { integrationActions } from '.';

const persistIntegrations: SaveSubscriber = (_, data) => {
  const { state, persist } = data;

  persist.integrations = state.integrations.map((integration) => ({
    id: integration.id,
    enabled: Boolean(integration.enabled),
    values: integration.dirtyValues,
  }));
};

const handleUpsert: UpdatedSubscriber = (_, { dispatch }) => {
  dispatch(integrationActions.cleanDirtyValues());
};

PubSub.subscribe(TOPIC_SAVE, persistIntegrations);
PubSub.subscribe(TOPIC_UPSERTED, handleUpsert);
