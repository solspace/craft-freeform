import { Drag, type DragItem } from "@editor/builder/types/drag";
import { isContainer } from "@editor/store/thunks/fields/containers";
import { isComponentType } from "../../field-list/catalog/components/component.presets";

export const sectionDragPresentation = (
  item?: DragItem | null,
): { sectionHeight: number; sectionLabel: string; sectionPreview: string } => {
  if (
    !item ||
    (item.type !== Drag.Field && item.type !== Drag.FieldType) ||
    !isContainer(item.data)
  )
    return { sectionHeight: 0, sectionLabel: "", sectionPreview: "" };
  if (item.type === Drag.Field)
    return {
      sectionHeight: Math.max(96, Math.min(320, item.height || 140)),
      sectionLabel: item.data.properties.label || "Section",
      sectionPreview: item.preview || "",
    };
  if (item.type === Drag.FieldType)
    return {
      sectionHeight: isComponentType(item.data) ? 180 : 110,
      sectionLabel: item.data.name,
      sectionPreview: "",
    };
  return { sectionHeight: 0, sectionLabel: "", sectionPreview: "" };
};
