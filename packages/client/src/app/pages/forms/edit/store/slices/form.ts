import type { Form } from '@ff-client/types/forms';
import type { GenericValue } from '@ff-client/types/properties';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { ErrorList } from 'client/config/axios/APIError';
import PubSub from 'pubsub-js';
import { v4 } from 'uuid';

import type {
  CreatedSubscriber,
  ErrorsSubscriber,
  SaveSubscriber,
} from '../middleware/state-persist';
import { TOPIC_CREATED } from '../middleware/state-persist';
import { TOPIC_ERRORS } from '../middleware/state-persist';
import { TOPIC_SAVE } from '../middleware/state-persist';
import type { RootState } from '../store';

type FormState = Form & {
  errors?: ErrorList;
};

const initialState: FormState = {
  id: null,
  uid: v4(),
  type: 'Solspace\\Freeform\\Form\\Types\\Regular',
  properties: {
    name: 'New Form',
    handle: 'newForm',
  },
};

type UpdateProps = Partial<Omit<FormState, 'properties'>>;
type ModifyProps = { key: string; value: GenericValue };
type ErrorProps = { key: string; errors: string[] };

export const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    update: (state, { payload }: PayloadAction<UpdateProps>) => {
      Object.assign(state, payload);
    },
    modifyProperty: (
      state,
      { payload: { key, value } }: PayloadAction<ModifyProps>
    ) => {
      state.properties[key] = value;
    },
    removeError: (state, { payload }: PayloadAction<string>) => {
      delete state.errors[payload];
    },
    addError: (state, { payload }: PayloadAction<ErrorProps>) => {
      state.errors[payload.key] = payload.errors;
    },
    setErrors: (state, { payload }: PayloadAction<ErrorList>) => {
      state.errors = payload;
    },
    clearErrors: (state) => {
      state.errors = undefined;
    },
  },
});

export const {
  update,
  modifyProperty,
  addError,
  removeError,
  setErrors,
  clearErrors,
} = formSlice.actions;

export const selectFormId = (state: RootState): number | undefined =>
  state.form.id;

export default formSlice.reducer;

const persistForm: SaveSubscriber = (_, data) => {
  const { state, persist } = data;

  const { id, uid, type, properties } = state.form;

  persist.form = {
    id,
    uid,
    type,
    properties,
  };
};

const handleErrors: ErrorsSubscriber = (_, { dispatch, response }) => {
  dispatch(clearErrors());
  dispatch(setErrors(response.errors?.form));
};

const handleCreate: CreatedSubscriber = (_, { dispatch, response }) => {
  dispatch(update({ id: response.data.form.id }));
};

PubSub.subscribe(TOPIC_SAVE, persistForm);
PubSub.subscribe(TOPIC_ERRORS, handleErrors);
PubSub.subscribe(TOPIC_CREATED, handleCreate);
