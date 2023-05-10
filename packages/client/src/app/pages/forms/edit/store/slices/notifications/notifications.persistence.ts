import type {
  ErrorsSubscriber,
  SaveSubscriber,
} from '@editor/store/middleware/state-persist';
import {
  TOPIC_ERRORS,
  TOPIC_SAVE,
  TOPIC_UPSERTED,
} from '@editor/store/middleware/state-persist';

import { notificationActions } from '.';

const persistNotifications: SaveSubscriber = (_, data) => {
  const { state, persist } = data;

  let payload = null;
  if (state.notifications.initialized) {
    payload = state.notifications.items;
  }

  persist.notifications = payload;
};

const handleErrors: ErrorsSubscriber = (_, { dispatch, response }) => {
  dispatch(notificationActions.clearErrors());
  dispatch(notificationActions.setErrors(response.errors?.notifications));
};

const handleUpserted: ErrorsSubscriber = (_, { dispatch }) => {
  dispatch(notificationActions.clearErrors());
};

PubSub.subscribe(TOPIC_SAVE, persistNotifications);
PubSub.subscribe(TOPIC_ERRORS, handleErrors);
PubSub.subscribe(TOPIC_UPSERTED, handleUpserted);
