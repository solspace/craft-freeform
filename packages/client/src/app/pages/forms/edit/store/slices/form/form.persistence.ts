import type {
  CreatedSubscriber,
  ErrorsSubscriber,
  SaveSubscriber,
} from '@editor/store/middleware/state-persist';
import {
  TOPIC_CREATED,
  TOPIC_ERRORS,
  TOPIC_SAVE,
  TOPIC_UPSERTED,
} from '@editor/store/middleware/state-persist';

import type { FormErrors } from './form.types';
import { formActions } from '.';

const persist: SaveSubscriber = (_, data) => {
  const { state, persist } = data;

  const { id, uid, type, settings } = state.form;

  persist.form = {
    id,
    uid,
    type,
    settings,
  };
};

const handleErrors: ErrorsSubscriber = (_, { dispatch, response }) => {
  dispatch(formActions.clearErrors());
  dispatch(formActions.setErrors(response.errors?.form as FormErrors));
};

const handleUpsert: ErrorsSubscriber = (_, { dispatch }) => {
  dispatch(formActions.clearErrors());
};

const handleCreate: CreatedSubscriber = (_, { dispatch, response }) => {
  dispatch(formActions.update({ id: response.data.form.id }));
};

PubSub.subscribe(TOPIC_SAVE, persist);
PubSub.subscribe(TOPIC_ERRORS, handleErrors);
PubSub.subscribe(TOPIC_CREATED, handleCreate);
PubSub.subscribe(TOPIC_UPSERTED, handleUpsert);
