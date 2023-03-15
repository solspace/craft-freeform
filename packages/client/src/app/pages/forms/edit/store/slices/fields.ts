import type { RootState } from '@editor/store';
import type {
  ErrorsSubscriber,
  SaveSubscriber,
} from '@editor/store/middleware/state-persist';
import { TOPIC_UPSERTED } from '@editor/store/middleware/state-persist';
import { TOPIC_ERRORS } from '@editor/store/middleware/state-persist';
import { TOPIC_SAVE } from '@editor/store/middleware/state-persist';
import type { PropertyValueCollection } from '@ff-client/types/fields';
import type { GenericValue } from '@ff-client/types/properties';
import type { FieldType } from '@ff-client/types/properties';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import PubSub from 'pubsub-js';

type FieldErrors = {
  [key: string]: string[];
};

export type Field = Pick<FieldType, 'typeClass'> & {
  uid: string;
  properties: PropertyValueCollection;
  errors?: FieldErrors;
};

type FieldState = Field[];

type EditType = {
  uid: string;
  handle: string;
  value: GenericValue;
};

type ErrorPayload = {
  [key: string]: FieldErrors;
};

const initialState: FieldState = [];

export const fieldsSlice = createSlice({
  name: 'fields',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<FieldState>) => {
      state.splice(0, state.length, ...action.payload);
    },
    add: (
      state,
      action: PayloadAction<{ fieldType: FieldType; uid: string }>
    ) => {
      const { uid, fieldType } = action.payload;
      const properties: PropertyValueCollection = {};
      fieldType.properties.forEach(
        (prop) => (properties[prop.handle] = prop.value)
      );

      state.push({
        uid,
        typeClass: fieldType.typeClass,
        properties,
      });
    },
    remove: (state, { payload: uid }: PayloadAction<string>) => {
      state.splice(
        state.findIndex((item) => item.uid === uid),
        1
      );
    },
    edit: (state, action: PayloadAction<EditType>) => {
      const { uid, handle, value } = action.payload;

      state.find((field) => field.uid === uid).properties[handle] = value;
    },
    clearErrors: (state) => {
      for (const field of state) {
        field.errors = undefined;
      }
    },
    setErrors: (state, action: PayloadAction<ErrorPayload>) => {
      const { payload } = action;

      for (const field of state) {
        field.errors = payload?.[field.uid];
      }
    },
  },
});

export const { set, add, remove, edit, clearErrors, setErrors } =
  fieldsSlice.actions;

export const selectField =
  (uid: string) =>
  (state: RootState): Field =>
    state.fields.find((field) => field.uid === uid);

export const selectFieldsHaveErrors = (state: RootState): boolean =>
  Boolean(state.fields.find((field) => field.errors !== undefined));

export default fieldsSlice.reducer;

const persistFields: SaveSubscriber = (_, data) => {
  const { state, persist } = data;

  persist.fields = state.fields;
};

const handleErrors: ErrorsSubscriber = (_, { dispatch, response }) => {
  dispatch(clearErrors());
  dispatch(setErrors(response.errors?.fields));
};

const handleUpserted: ErrorsSubscriber = (_, { dispatch }) => {
  dispatch(clearErrors());
};

PubSub.subscribe(TOPIC_SAVE, persistFields);
PubSub.subscribe(TOPIC_ERRORS, handleErrors);
PubSub.subscribe(TOPIC_UPSERTED, handleUpserted);
