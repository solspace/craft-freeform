import { applyLabels } from "@editor/store/actions/labels";
import { Fields } from "@ff-client/types/field.classes";
import type {
  FieldType,
  PropertyValueCollection,
} from "@ff-client/types/fields";
import type { GenericValue } from "@ff-client/types/properties";
import { updateComponentDesign } from "@ff-client/utils/component-design-settings";
import {
  iconAccessibleName,
  initializeDividerProperties,
  initializeIconProperties,
  initializeLayoutProperties,
  normalizeLegacyCardRadius,
} from "@ff-client/utils/content-field-defaults";
import translate from "@ff-client/utils/translations";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import camelCase from "lodash/camelCase";
import { uniqueFieldHandle } from "./unique-handle";

import "./fields.persistence";

type FieldErrors = {
  [key: string]: string[];
};

export type Field = Pick<FieldType, "typeClass"> & {
  id?: number;
  uid: string;
  properties: PropertyValueCollection;
  errors?: FieldErrors;
  rowUid?: string;
  order?: number;
};

export type FieldStore = Field[];

type EditType = {
  uid: string;
  handle: string;
  value: GenericValue;
};

type EditBatch = {
  uid: string;
  typeClass: string;
  properties: PropertyValueCollection;
};

type MoveToPayload = {
  uid: string;
  rowUid: string;
  position: number;
};

type ErrorPayload = {
  [key: string]: FieldErrors;
};

const initialState: FieldStore = [];

export const fieldsSlice = createSlice({
  name: "layout/fields",
  initialState,
  reducers: {
    editDesign: (
      state,
      action: PayloadAction<EditType & { reset?: boolean }>,
    ) => {
      const { uid, handle, value, reset } = action.payload;
      const field = state.find((item) => item.uid === uid);
      if (!field || field.typeClass !== Fields.Layout) return;
      field.properties = updateComponentDesign(
        field.properties,
        handle,
        value,
        reset,
      );
    },
    set: (state, action: PayloadAction<FieldStore>) => {
      state.splice(
        0,
        state.length,
        ...action.payload.map((field) =>
          field.typeClass === Fields.Layout
            ? {
                ...field,
                properties: normalizeLegacyCardRadius(field.properties),
              }
            : field,
        ),
      );
    },
    add: (
      state,
      action: PayloadAction<{
        uid: string;
        rowUid: string;
        fieldType: FieldType;
        order?: number;
      }>,
    ) => {
      const { uid, rowUid, fieldType, order } = action.payload;
      const highestOrder = Math.max(
        -1,
        ...state
          .filter((field) => field.rowUid === action.payload.rowUid)
          .map((field) => field.order),
      );

      let properties: PropertyValueCollection = {};
      fieldType.properties.forEach((prop) => {
        properties[prop.handle] = prop.value;
      });
      if (fieldType.typeClass === Fields.Layout)
        properties = normalizeLegacyCardRadius(properties);
      if (!fieldType.fromFavorite && fieldType.typeClass === Fields.Icon)
        initializeIconProperties(properties);
      if (!fieldType.fromFavorite && fieldType.typeClass === Fields.Divider)
        initializeDividerProperties(properties);
      if (!fieldType.fromFavorite && fieldType.typeClass === Fields.Layout)
        initializeLayoutProperties(properties);

      if (!properties.label) {
        const count = state.filter(
          (field) => field.typeClass === fieldType.typeClass,
        ).length;

        let label = translate(fieldType.name);
        if (count > 0) {
          label += ` ${count}`;
        }

        properties.label = label;
        properties.handle = camelCase(label);
        if (fieldType.type === "layout")
          properties.handle = camelCase(`layout ${label}`);
      }

      properties.handle = uniqueFieldHandle(
        state,
        String(
          properties.handle || camelCase(String(properties.label)) || "field",
        ),
      );

      state.push({
        uid,
        rowUid,
        typeClass: fieldType.typeClass,
        properties,
        order: order !== undefined ? order : highestOrder + 1,
      });

      // shift all other fields on the right by 1 order
      if (order !== undefined) {
        state
          .filter((field) => field.rowUid === rowUid)
          .filter((field) => field.uid !== uid)
          .forEach((field) => {
            if (field.order >= order) {
              field.order += 1;
            }
          });
      }
    },
    duplicate: (
      state,
      action: PayloadAction<{
        uid: string;
        rowUid: string;
        field: Field;
      }>,
    ) => {
      const { uid, rowUid, field } = action.payload;
      const highestOrder = Math.max(
        -1,
        ...state
          .filter((fieldItem) => fieldItem.rowUid === rowUid)
          .map((fieldItem) => fieldItem.order ?? -1),
      );

      const properties = { ...field.properties };

      const originalHandle = String(properties.handle || "field").replace(
        /_\d+$/,
        "",
      );
      properties.handle = uniqueFieldHandle(state, originalHandle);

      state.push({
        uid,
        rowUid,
        typeClass: field.typeClass,
        properties,
        order: highestOrder + 1,
      });
    },
    remove: (state, { payload: uid }: PayloadAction<string>) => {
      state.splice(
        state.findIndex((item) => item.uid === uid),
        1,
      );
    },
    removeBatch: (state, { payload: uids }: PayloadAction<string[]>) => {
      uids.forEach((uid) => {
        state.splice(
          state.findIndex((item) => item.uid === uid),
          1,
        );
      });
    },
    edit: (state, action: PayloadAction<EditType>) => {
      const { uid, handle, value } = action.payload;

      const field = state.find((field) => field.uid === uid);
      if (
        field.typeClass === Fields.Icon &&
        handle === "icon" &&
        value !== field.properties.icon
      ) {
        const current = field.properties.accessibleText;
        if (!current || current === iconAccessibleName(field.properties.icon)) {
          field.properties.accessibleText = iconAccessibleName(value);
        }
      }
      field.properties[handle] = value;
    },
    batchEdit: (state, action: PayloadAction<EditBatch>) => {
      const { uid, typeClass, properties } = action.payload;

      const field = state.find((field) => field.uid === uid);
      const nextProperties = { ...properties };
      if (typeClass === Fields.Icon && field.typeClass !== Fields.Icon)
        initializeIconProperties(nextProperties);
      if (typeClass === Fields.Divider && field.typeClass !== Fields.Divider)
        initializeDividerProperties(nextProperties);
      if (typeClass === Fields.Layout && field.typeClass !== Fields.Layout)
        initializeLayoutProperties(nextProperties);
      field.typeClass = typeClass;
      field.properties = nextProperties;
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
    moveTo: (state, action: PayloadAction<MoveToPayload>) => {
      const { uid, rowUid, position } = action.payload;
      const movedField = state.find((field) => field.uid === uid);

      const previosRowUid = movedField.rowUid;
      const previousPosition = movedField.order;
      const isSameRow = previosRowUid === rowUid;

      if (previousPosition === undefined) {
        return;
      }

      movedField.rowUid = rowUid;
      movedField.order = position;

      if (!isSameRow) {
        // Reset the order of fields in previous row
        state
          .filter((field) => field.rowUid === previosRowUid)
          .forEach((field) => {
            const isAfterMovedField = field.order >= previousPosition;
            field.order -= isAfterMovedField ? 1 : 0;
          });

        // update all new row orders after the new field
        state
          .filter((field) => field.rowUid === rowUid)
          .filter((field) => field.uid !== movedField.uid)
          .forEach((field) => {
            const isAfterMovedField = field.order >= movedField.order;
            field.order += isAfterMovedField ? 1 : 0;
          });
      }

      if (isSameRow) {
        // re-calculate orders for the current row
        state
          .filter((field) => field.rowUid === rowUid)
          .filter((field) => field.uid !== movedField.uid)
          .forEach((field) => {
            if (field.order > previousPosition && field.order <= position) {
              field.order -= 1;
            }

            if (field.order < previousPosition && field.order >= position) {
              field.order += 1;
            }
          });
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(applyLabels, (state, { payload }) => {
      if (payload.siteId !== undefined) return;
      const labels = new Map(
        payload.labels.map(({ uid, label }) => [uid, label]),
      );
      for (const field of state) {
        const label = labels.get(field.uid);
        if (label !== undefined) field.properties.label = label;
      }
    });
  },
});

const { actions } = fieldsSlice;

export { actions as fieldActions };

export default fieldsSlice.reducer;
