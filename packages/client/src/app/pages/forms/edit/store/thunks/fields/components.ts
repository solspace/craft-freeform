import {
  type ComponentFieldType,
  type ComponentNode,
  componentNodes,
  isComponentType,
} from "@editor/builder/tabs/layout/field-list/catalog/components/component.presets";
import type { AppThunk, RootState } from "@editor/store";
import { fieldActions } from "@editor/store/slices/layout/fields";
import { uniqueFieldHandle } from "@editor/store/slices/layout/fields/unique-handle";
import { rowActions } from "@editor/store/slices/layout/rows";
import { Fields } from "@ff-client/types/field.classes";
import type { FieldType } from "@ff-client/types/fields";
import translate from "@ff-client/utils/translations";
import camelCase from "lodash/camelCase";
import { v4 } from "uuid";
import { initializeContainer } from "./containers";

export const validComponent = (type: FieldType): boolean =>
  !isComponentType(type) ||
  componentNodes(type.component.root).every((node) =>
    type.component.types.some(
      (item) => item.typeClass === node.typeClass && item.visible,
    ),
  );

/** Materialize a preset as ordinary fields in one synchronous history operation. */
export const populateComponent = (
  dispatch: Parameters<AppThunk>[0],
  getState: () => RootState,
  uid: string,
  type: ComponentFieldType,
): void => {
  const populate = (uid: string, node: ComponentNode): void => {
    const properties = { label: translate(node.label), ...node.properties };
    const stem = camelCase(translate(node.label)) || "component";
    const handle = uniqueFieldHandle(getState().layout.fields, stem, uid);
    for (const [key, value] of Object.entries({ ...properties, handle }))
      dispatch(fieldActions.edit({ uid, handle: key, value }));
    dispatch(initializeContainer(uid));
    const root = getState().layout.fields.find((field) => field.uid === uid)!;
    const addChildren = (
      layoutUid: string,
      children: ComponentNode[],
    ): void => {
      for (const child of children) {
        const rowUid = v4(),
          fieldUid = v4();
        const fieldType = type.component.types.find(
          (item) => item.typeClass === child.typeClass,
        )!;
        dispatch(rowActions.add({ uid: rowUid, layoutUid }));
        dispatch(fieldActions.add({ uid: fieldUid, rowUid, fieldType }));
        populate(fieldUid, child);
      }
    };
    if (node.children)
      addChildren(String(root.properties.layout), node.children);
    if (node.columns) {
      const state = getState();
      const rows = state.layout.rows.filter(
        (row) => row.layoutUid === root.properties.layout,
      );
      const columns = state.layout.fields
        .filter(
          (field) =>
            field.typeClass === Fields.LayoutColumn &&
            rows.some((row) => row.uid === field.rowUid),
        )
        .sort((a, b) => a.order - b.order);
      node.columns.forEach((children, index) => {
        addChildren(String(columns[index].properties.layout), children);
      });
    }
  };
  populate(uid, type.component.root);
};
