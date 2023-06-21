import type { PropertyValueCollection } from '@ff-client/types/fields';
import type { GenericValue } from '@ff-client/types/properties';
import type { FieldType } from '@ff-client/types/properties';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import camelCase from 'lodash.camelcase';
import { transliterate } from 'transliteration';
import { adjectives, uniqueNamesGenerator } from 'unique-names-generator';

import './fields.persistence';

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

      const label = uniqueNamesGenerator({
        dictionaries: [adjectives, [fieldType.name], ['field']],
        separator: ' ',
        style: 'capital',
      });

      properties.label = label;
      properties.handle = camelCase(label);

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
      let { value } = action.payload;
      const { uid, handle } = action.payload;

      if (handle == 'handle') {
        value = transliterate(value);
      }

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

const { actions } = fieldsSlice;
export { actions as fieldActions };

export default fieldsSlice.reducer;
