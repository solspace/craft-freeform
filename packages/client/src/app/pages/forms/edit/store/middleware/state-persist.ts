import type { GenericValue } from '@ff-client/types/properties';
import type { AxiosResponse } from 'axios';
import axios from 'axios';
import type { APIError } from 'client/config/axios/APIError';
import PubSub from 'pubsub-js';
import type { Middleware } from 'redux';

import { save } from '../actions/form';
import type { AppDispatch, RootState } from '../store';

export const TOPIC_SAVE = Symbol('form.save');
export const TOPIC_ERRORS = Symbol('form.save.errors');
export const TOPIC_CREATED = Symbol('form.save.crated');
export const TOPIC_UPDATED = Symbol('form.save.updated');

type WithDispatch = { readonly dispatch: AppDispatch };

type SaveData = WithDispatch & {
  readonly state: RootState;
  persist: Record<string, GenericValue>;
};

type ErrorData = WithDispatch & { response: APIError };
type CreateData = WithDispatch & { response: AxiosResponse };

export type SaveSubscriber = (message: string | symbol, data: SaveData) => void;
export type ErrorsSubscriber = (
  message: string | symbol,
  data: ErrorData
) => void;
export type CreatedSubscriber = (
  message: string | symbol,
  data: CreateData
) => void;
export type UpdatedSubscriber = CreatedSubscriber;

PubSub.clearAllSubscriptions();

const publishErrors = (dispatch: AppDispatch, response: APIError): void => {
  PubSub.publish(TOPIC_ERRORS, {
    dispatch,
    response,
  } as ErrorData);
};

const publishCreated = (
  dispatch: AppDispatch,
  response: AxiosResponse
): void => {
  PubSub.publish(TOPIC_CREATED, { dispatch, response } as CreateData);
};
const publishUpdated = (
  dispatch: AppDispatch,
  response: AxiosResponse
): void => {
  PubSub.publish(TOPIC_UPDATED, { dispatch, response } as CreateData);
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
        .put(`/client/api/forms/${formId}`, data.persist)
        .then((response) => publishUpdated(dispatch, response))
        .catch((error: APIError) => publishErrors(dispatch, error));
    } else {
      axios
        .post('/client/api/forms', data.persist)
        .then((response) => publishCreated(dispatch, response))
        .catch((error: APIError) => publishErrors(dispatch, error));
    }
  };
