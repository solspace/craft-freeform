import {
  FieldProperty,
  FieldType,
  GenericValue,
  PropertyValueCollection,
} from '@ff-client/types/fields';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../store';

export type Field = Pick<FieldType, 'typeClass'> & {
  uid: string;
  properties: PropertyValueCollection;
};

type FieldState = Field[];

type EditType = {
  uid: string;
  property: FieldProperty;
  value: GenericValue;
};

const initialState: FieldState = [];

export const fieldsSlice = createSlice({
  name: 'fields',
  initialState,
  reducers: {
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
      const {
        uid,
        property: { handle },
        value,
      } = action.payload;

      state.find((field) => field.uid === uid).properties[handle] = value;
    },
  },
});

export const { add, remove, edit } = fieldsSlice.actions;

export const selectField =
  (uid: string) =>
  (state: RootState): Field =>
    state.fields.find((field) => field.uid === uid);

export default fieldsSlice.reducer;
