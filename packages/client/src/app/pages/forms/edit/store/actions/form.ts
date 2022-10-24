import type { GenericValue } from '@ff-client/types/fields';
import type { Middleware } from '@reduxjs/toolkit';
import { createAction } from '@reduxjs/toolkit';
import axios from 'axios';
import PubSub from 'pubsub-js';

import type { RootState } from '../store';

export const save = createAction('form/save');

export const TOPIC_SAVE = Symbol('form.save');

type SaveData = {
  readonly state: RootState;
  persist: Record<string, GenericValue>;
};

export type SaveSubscriber = (message: string | symbol, data: SaveData) => void;

PubSub.clearAllSubscriptions();
export const saveMiddleware: Middleware =
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

    await axios.put('/client/api/forms', data.persist);
  };
