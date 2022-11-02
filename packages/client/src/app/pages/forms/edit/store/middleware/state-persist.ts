import type { GenericValue } from '@ff-client/types/properties';
import axios from 'axios';
import type { APIError } from 'client/config/axios/APIError';
import PubSub from 'pubsub-js';
import type { Middleware } from 'redux';

import { save } from '../actions/form';
import type { AppDispatch, RootState } from '../store';

export const TOPIC_SAVE = Symbol('form.save');
export const TOPIC_ERRORS = Symbol('form.save.errors');

type SaveData = {
  readonly dispatch: AppDispatch;
  readonly state: RootState;
  persist: Record<string, GenericValue>;
};

type ErrorData = {
  readonly dispatch: AppDispatch;
  response: APIError;
};

export type SaveSubscriber = (message: string | symbol, data: SaveData) => void;
export type ErrorsSubscriber = (
  message: string | symbol,
  data: ErrorData
) => void;

PubSub.clearAllSubscriptions();

const publishErrors = (dispatch: AppDispatch, response: APIError): void => {
  PubSub.publish(TOPIC_ERRORS, {
    dispatch,
    response,
  } as ErrorData);
};

export const statePersistMiddleware: Middleware =
  (store) => (next) => (action) => {
    next(action);
    if (action.type !== String(save)) {
      return;
    }

    const dispatch = store.dispatch as AppDispatch;

    const data: SaveData = {
      dispatch,
      state: store.getState(),
      persist: {},
    };

    PubSub.publishSync(TOPIC_SAVE, data);

    const formId = data.state.form.id;
    if (formId) {
      axios
        .put<SaveData>(`/client/api/forms/${formId}`, data.persist)
        .catch((error: APIError) => publishErrors(dispatch, error));
    } else {
      axios
        .post<SaveData>('/client/api/forms', data.persist)
        .catch((error: APIError) => publishErrors(dispatch, error));
    }
  };
