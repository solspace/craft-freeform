import type { AppThunk } from "@editor/store";
import { formActions } from "@editor/store/slices/form";
import { fieldActions } from "@editor/store/slices/layout/fields";
import { layoutActions } from "@editor/store/slices/layout/layouts";
import { rowActions } from "@editor/store/slices/layout/rows";
import { Fields } from "@ff-client/types/field.classes";
import type { FieldType } from "@ff-client/types/fields";
import { v4 } from "uuid";

export const PAGE_FORM_TYPE =
  "Solspace\\Freeform\\Bundles\\Form\\Types\\Pages\\Page";

const formSectionType: FieldType = {
  name: "Form",
  typeClass: Fields.FormSection,
  type: "form-section",
  visible: true,
  implements: [],
  properties: [],
};

export const addFormSection = (): AppThunk => (dispatch, getState) => {
  const page = getState().layout.pages[0];
  if (
    !page ||
    getState().layout.fields.some(
      (field) => field.typeClass === Fields.FormSection,
    )
  )
    return;

  const existingRows = getState()
    .layout.rows.filter((row) => row.layoutUid === page.layoutUid)
    .sort((a, b) => a.order - b.order);
  const rowUid = v4();
  const fieldUid = v4();
  const innerLayoutUid = v4();
  dispatch(layoutActions.add({ uid: innerLayoutUid }));
  dispatch(rowActions.add({ uid: rowUid, layoutUid: page.layoutUid }));
  dispatch(
    fieldActions.add({ uid: fieldUid, rowUid, fieldType: formSectionType }),
  );
  dispatch(
    fieldActions.edit({
      uid: fieldUid,
      handle: "layout",
      value: innerLayoutUid,
    }),
  );
  existingRows.forEach((row) => {
    dispatch(
      rowActions.moveToLayout({ uid: row.uid, layoutUid: innerLayoutUid }),
    );
  });
};

export const removeFormSection = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const section = state.layout.fields.find(
    (field) => field.typeClass === Fields.FormSection,
  );
  if (!section) return;
  const page = state.layout.pages[0];
  const row = state.layout.rows.find((item) => item.uid === section.rowUid);
  const layoutUid = section.properties.layout as string | undefined;
  if (!page || !row || !layoutUid) return;
  const rows = state.layout.rows
    .filter((item) => item.layoutUid === layoutUid)
    .sort((a, b) => a.order - b.order);
  rows.forEach((item, index) => {
    dispatch(
      rowActions.moveToLayoutAt({
        uid: item.uid,
        layoutUid: row.layoutUid,
        order: row.order + index,
      }),
    );
  });
  dispatch(fieldActions.remove(section.uid));
  dispatch(rowActions.remove(row.uid));
  dispatch(layoutActions.remove(layoutUid));
};

export const changeFormType =
  (value: string): AppThunk =>
  (dispatch, getState) => {
    const currentType =
      getState().form.settings?.general?.type ?? getState().form.type;
    if (value === currentType) return;
    if (currentType === PAGE_FORM_TYPE) dispatch(removeFormSection());
    dispatch(
      formActions.modifySettings({ namespace: "general", key: "type", value }),
    );
    if (value === PAGE_FORM_TYPE) dispatch(addFormSection());
  };
