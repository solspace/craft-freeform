import type { GenericValue } from '@ff-client/types/properties';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import PubSub from 'pubsub-js';
import { v4 } from 'uuid';

import type { SaveSubscriber } from '../middleware/state-persist';
import { TOPIC_SAVE } from '../middleware/state-persist';

type FormState = {
  id?: number;
  uid: string;
  name: string;
  handle: string;
  type: string;
  properties: {
    [key: string]: GenericValue;
  };
};

const initialState: FormState = {
  id: null,
  uid: v4(),
  name: 'New Form',
  handle: 'newForm',
  type: 'Solspace\\Freeform\\Form\\Types\\Regular',
  properties: [],
};

type UpdateProps = Partial<Omit<FormState, 'properties'>>;
type ModifyProps = { key: string; value: GenericValue };

export const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    update: (state, { payload }: PayloadAction<UpdateProps>) => {
      state = { ...state, ...payload };
    },
    modifyProperty: (
      state,
      { payload: { key, value } }: PayloadAction<ModifyProps>
    ) => {
      state.properties[key] = value;
    },
  },
});

export const { update, modifyProperty } = formSlice.actions;

export default formSlice.reducer;

const persistForm: SaveSubscriber = (_, data) => {
  const { state, persist } = data;

  persist.form = state.form;
};

PubSub.subscribe(TOPIC_SAVE, persistForm);
