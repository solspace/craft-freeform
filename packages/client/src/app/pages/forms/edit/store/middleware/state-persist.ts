import type { AppDispatch, RootState } from '@editor/store';
import type { APIError } from '@ff-client/types/api';
import type { GenericValue } from '@ff-client/types/properties';
import type { AxiosResponse } from 'axios';
import axios from 'axios';
import PubSub from 'pubsub-js';
import type { Middleware } from 'redux';

import { save } from '../actions/form';
import { setState, State } from '../slices/context';

export const TOPIC_SAVE = Symbol('form.save');
export const TOPIC_ERRORS = Symbol('form.save.errors');
export const TOPIC_CREATED = Symbol('form.save.crated');
export const TOPIC_UPDATED = Symbol('form.save.updated');
export const TOPIC_UPSERTED = Symbol('form.save.upserted');

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

  dispatch(setState(State.Idle));
};

const publishCreated = (
  dispatch: AppDispatch,
  response: AxiosResponse
): void => {
  PubSub.publish(TOPIC_CREATED, { dispatch, response } as CreateData);
  PubSub.publish(TOPIC_UPSERTED, { dispatch, response } as CreateData);

  dispatch(setState(State.Idle));
};

const publishUpdated = (
  dispatch: AppDispatch,
  response: AxiosResponse
): void => {
  PubSub.publish(TOPIC_UPDATED, { dispatch, response } as CreateData);
  PubSub.publish(TOPIC_UPSERTED, { dispatch, response } as CreateData);

  dispatch(setState(State.Idle));
};

export const statePersistMiddleware: Middleware =
  (store) => (next) => (action) => {
    if (!action) {
      return;
    }

    next(action);
    if (action.type !== String(save)) {
      return;
    }

    const dispatch = store.dispatch as AppDispatch;

    dispatch(setState(State.Processing));

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
