import {
  catalogTypes,
  containerTypes,
  layoutPresets,
} from "@editor/builder/tabs/layout/field-list/catalog/catalog.types";
import type { AppDispatch, AppThunk, RootState } from "@editor/store";
import { type Field, fieldActions } from "@editor/store/slices/layout/fields";
import { layoutActions } from "@editor/store/slices/layout/layouts";
import { rowActions } from "@editor/store/slices/layout/rows";
import { Fields } from "@ff-client/types/field.classes";
import { v4 } from "uuid";

export const isContainer = (field: Pick<Field, "typeClass">): boolean =>
  containerTypes.includes(field.typeClass);

export const isPageForm = (state: RootState): boolean =>
  (state.form.settings?.general?.type ?? state.form.type) ===
  "Solspace\\Freeform\\Bundles\\Form\\Types\\Pages\\Page";

export const isInputField = (source: Pick<Field, "typeClass">): boolean =>
  !catalogTypes.includes(source.typeClass);

const isFirstPageCanvasLayout = (state: RootState, target: string): boolean => {
  const canvas = state.layout.pages[0]?.layoutUid;
  const seen = new Set<string>();
  let layoutUid: string | undefined = target;
  while (layoutUid && !seen.has(layoutUid)) {
    if (layoutUid === canvas) return true;
    seen.add(layoutUid);
    const owner = state.layout.fields.find(
      (field) => field.properties.layout === layoutUid,
    );
    if (!owner || owner.typeClass === Fields.FormSection) return false;
    layoutUid = state.layout.rows.find(
      (row) => row.uid === owner.rowUid,
    )?.layoutUid;
  }
  return false;
};

const containsInputFields = (state: RootState, sourceUid?: string): boolean => {
  const source = state.layout.fields.find((field) => field.uid === sourceUid);
  if (!source) return false;
  if (isInputField(source)) return true;
  const layoutUid = source.properties.layout;
  if (!layoutUid) return false;
  const rowUids = state.layout.rows
    .filter((row) => row.layoutUid === layoutUid)
    .map((row) => row.uid);
  return state.layout.fields
    .filter((field) => rowUids.includes(field.rowUid))
    .some((field) => containsInputFields(state, field.uid));
};

export const canPlaceField = (
  state: RootState,
  source: Pick<Field, "typeClass"> & { uid?: string },
  target: string,
): boolean => {
  if (isPageForm(state)) {
    const pageLayout = state.layout.pages[0]?.layoutUid;
    if (source.typeClass === Fields.FormSection) {
      if (!pageLayout || !isFirstPageCanvasLayout(state, target)) return false;
      if (
        state.layout.fields.some(
          (field) =>
            field.typeClass === Fields.FormSection && field.uid !== source.uid,
        )
      )
        return false;
    } else if (isInputField(source) || containsInputFields(state, source.uid)) {
      let ancestorLayout = target;
      let insideForm = false;
      const seen = new Set<string>();
      while (ancestorLayout && !seen.has(ancestorLayout)) {
        seen.add(ancestorLayout);
        const owner = state.layout.fields.find(
          (field) => field.properties.layout === ancestorLayout,
        );
        if (owner?.typeClass === Fields.FormSection) {
          insideForm = true;
          break;
        }
        ancestorLayout = state.layout.rows.find(
          (row) => row.uid === owner?.rowUid,
        )?.layoutUid;
      }
      // Other builder pages are the steps displayed inside the Form section.
      if (
        !insideForm &&
        !state.layout.pages.slice(1).some((page) => page.layoutUid === target)
      )
        return false;
    }
  } else if (source.typeClass === Fields.FormSection) {
    return false;
  }
  const visited = new Set<string>();
  let layoutUid = target;
  while (layoutUid) {
    if (visited.has(layoutUid)) return false;
    visited.add(layoutUid);
    const owner = state.layout.fields.find(
      (field) => field.properties.layout === layoutUid,
    );
    if (!owner) return true;
    if (owner.uid === source.uid) return false;
    layoutUid = state.layout.rows.find(
      (row) => row.uid === owner.rowUid,
    )?.layoutUid;
  }
  return true;
};

const addColumn = (dispatch: AppDispatch, rowUid: string): void => {
  const uid = v4();
  const layoutUid = v4();
  dispatch(layoutActions.add({ uid: layoutUid }));
  dispatch(
    fieldActions.add({
      uid,
      rowUid,
      fieldType: {
        name: "Column",
        typeClass: Fields.LayoutColumn,
        type: "layout-column",
        visible: false,
        implements: [],
        properties: [],
      },
    }),
  );
  dispatch(fieldActions.edit({ uid, handle: "layout", value: layoutUid }));
};

export const initializeContainer =
  (uid: string): AppThunk =>
  (dispatch, getState) => {
    const field = getState().layout.fields.find((field) => field.uid === uid);
    if (!field || !isContainer(field) || field.properties.layout) return;
    const layoutUid = v4();
    dispatch(layoutActions.add({ uid: layoutUid }));
    dispatch(fieldActions.edit({ uid, handle: "layout", value: layoutUid }));
    if (field.typeClass !== Fields.Layout) return;
    const rowUid = v4();
    dispatch(rowActions.add({ uid: rowUid, layoutUid }));
    const preset =
      layoutPresets.find((item) => item.value === field.properties.preset) ??
      layoutPresets[0];
    for (let index = 0; index < preset.count; index++)
      addColumn(dispatch as AppDispatch, rowUid);
  };

export const changeLayoutPreset =
  (uid: string, preset: string): AppThunk =>
  (dispatch, getState) => {
    const selected = layoutPresets.find((item) => item.value === preset);
    const state = getState();
    const field = state.layout.fields.find((field) => field.uid === uid);
    if (!selected || field?.typeClass !== Fields.Layout) return;
    const rows = state.layout.rows
      .filter((row) => row.layoutUid === field.properties.layout)
      .sort((a, b) => a.order - b.order);
    const row = rows[0];
    if (!row) return;
    const columns = state.layout.fields
      .filter((item) => rows.some((row) => row.uid === item.rowUid))
      .sort((a, b) => a.order - b.order);
    if (columns.length < selected.count) {
      for (let index = columns.length; index < selected.count; index++)
        addColumn(dispatch as AppDispatch, row.uid);
    } else if (columns.length > selected.count) {
      const destination = columns[selected.count - 1].properties
        .layout as string;
      for (const column of columns.slice(selected.count)) {
        state.layout.rows
          .filter((row) => row.layoutUid === column.properties.layout)
          .sort((a, b) => a.order - b.order)
          .forEach((row) => {
            dispatch(
              rowActions.moveToLayout({ uid: row.uid, layoutUid: destination }),
            );
          });
        dispatch(fieldActions.remove(column.uid));
        dispatch(layoutActions.remove(column.properties.layout as string));
      }
    }
    dispatch(fieldActions.edit({ uid, handle: "preset", value: preset }));
  };
