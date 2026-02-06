import type { AppDispatch, RootState } from '@editor/store';
import type { APIError } from '@ff-client/types/api';
import type { GenericValue } from '@ff-client/types/properties';
import type { AxiosResponse } from 'axios';
import axios from 'axios';
import PubSub from 'pubsub-js';
import type { Middleware } from 'redux';

import { save } from '../actions/form';
import { contextActions, State } from '../slices/context';

export const TOPIC_SAVE = Symbol('form.save');
export const TOPIC_ERRORS = Symbol('form.save.errors');
export const TOPIC_CREATED = Symbol('form.save.crated');
export const TOPIC_UPDATED = Symbol('form.save.updated');
export const TOPIC_UPSERTED = Symbol('form.save.upserted');

type WithStateAndDispatch = {
  readonly getState: () => RootState;
  readonly dispatch: AppDispatch;
};

type SaveData = WithStateAndDispatch & {
  persist: Record<string, GenericValue>;
};

type ErrorData = WithStateAndDispatch & { response: APIError };
type CreateData = WithStateAndDispatch & { response: AxiosResponse };

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

const publishErrors = (
  getState: () => RootState,
  dispatch: AppDispatch,
  response: APIError
): void => {
  PubSub.publish(TOPIC_ERRORS, {
    getState,
    dispatch,
    response,
  } as ErrorData);

  dispatch(contextActions.setState(State.Idle));
};

const publishCreated = (
  getState: () => RootState,
  dispatch: AppDispatch,
  response: AxiosResponse
): void => {
  PubSub.publish(TOPIC_CREATED, {
    getState,
    dispatch,
    response,
  } as CreateData);
  PubSub.publish(TOPIC_UPSERTED, {
    getState,
    dispatch,
    response,
  } as CreateData);

  dispatch(contextActions.setState(State.Idle));
};

const publishUpdated = (
  getState: () => RootState,
  dispatch: AppDispatch,
  response: AxiosResponse
): void => {
  PubSub.publish(TOPIC_UPDATED, {
    getState,
    dispatch,
    response,
  } as CreateData);
  PubSub.publish(TOPIC_UPSERTED, {
    getState,
    dispatch,
    response,
  } as CreateData);

  dispatch(contextActions.setState(State.Idle));
};

export const statePersistMiddleware: Middleware =
  (store) => (next) => (action) => {
    if (!action) {
      return;
    }

    next(action);
    if (
      typeof action !== 'object' ||
      !('type' in action) ||
      action.type !== String(save)
    ) {
      return;
    }

    const dispatch = store.dispatch as AppDispatch;
    const getState = store.getState as () => RootState;

    dispatch(contextActions.setState(State.Processing));

    const data: SaveData = {
      getState,
      dispatch,
      persist: {},
    };

    PubSub.publishSync(TOPIC_SAVE, data);

    const formId = getState().form.id;
    if (formId) {
      axios
        .post(`/api/forms/${formId}`, data.persist)
        .then((response) => publishUpdated(getState, dispatch, response))
        .catch((error: APIError) => publishErrors(getState, dispatch, error));
    } else {
      axios
        .post('/api/forms', data.persist)
        .then((response) => publishCreated(getState, dispatch, response))
        .catch((error: APIError) => publishErrors(getState, dispatch, error));
    }
  };
