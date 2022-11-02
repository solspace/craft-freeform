import type { GenericValue } from '@ff-client/types/properties';
import axios from 'axios';
import PubSub from 'pubsub-js';
import type { Middleware } from 'redux';

import { save } from '../actions/form';
import type { RootState } from '../store';

export const TOPIC_SAVE = Symbol('form.save');

type SaveData = {
  readonly state: RootState;
  persist: Record<string, GenericValue>;
};

export type SaveSubscriber = (message: string | symbol, data: SaveData) => void;

PubSub.clearAllSubscriptions();
export const statePersistMiddleware: Middleware =
  (store) => (next) => async (action) => {
    next(action);
    if (action.type !== String(save)) {
      return;
    }

    const data: SaveData = {
      state: store.getState(),
      persist: {},
    };

    PubSub.publishSync(TOPIC_SAVE, data);

    const formId = data.state.form.id;
    if (formId) {
      return await axios.post(`/client/api/forms/${formId}`);
    }

    return await axios.put('/client/api/forms', data.persist);
  };
