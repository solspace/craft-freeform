import type { Row } from "@editor/builder/types/layout";
import type { AppDispatch, AppThunk, RootState } from "@editor/store";
import { type Field, fieldActions } from "@editor/store/slices/layout/fields";
import { layoutActions } from "@editor/store/slices/layout/layouts";
import { rowActions } from "@editor/store/slices/layout/rows";
import { Fields } from "@ff-client/types/field.classes";
import { v4 } from "uuid";

const isContainer = (field: Field) => field.typeClass === Fields.Group;

export default (field: Field, row: Row): AppThunk =>
  (dispatch, getState) => {
    duplicateField(getState(), dispatch as AppDispatch, field, row);
  };

export const duplicateField = (
  state: RootState,
  dispatch: AppDispatch,
  field: Field,
  row: Row,
): void => {
  const clone = (
    source: Field,
    rowUid: string,
    ancestors = new Set<string>(),
  ): void => {
    const properties = { ...source.properties };
    if (
      isContainer(source) &&
      properties.layout &&
      !ancestors.has(source.uid)
    ) {
      const nextAncestors = new Set(ancestors).add(source.uid);
      const layoutUid = v4();
      dispatch(layoutActions.add({ uid: layoutUid }));
      state.layout.rows
        .filter((row) => row.layoutUid === source.properties.layout)
        .sort((a, b) => a.order - b.order)
        .forEach((row) => {
          const newRowUid = v4();
          dispatch(rowActions.add({ uid: newRowUid, layoutUid }));
          state.layout.fields
            .filter((field) => field.rowUid === row.uid)
            .sort((a, b) => a.order - b.order)
            .forEach((child) => {
              clone(child, newRowUid, nextAncestors);
            });
        });
      properties.layout = layoutUid;
    }
    dispatch(
      fieldActions.duplicate({
        uid: v4(),
        rowUid,
        field: { ...source, properties },
      }),
    );
  };
  const rowUid = v4();
  dispatch(
    rowActions.add({
      uid: rowUid,
      layoutUid: row.layoutUid,
      order: row.order + 1,
    }),
  );
  clone(field, rowUid);
};
