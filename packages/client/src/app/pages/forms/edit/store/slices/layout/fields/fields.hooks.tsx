import type { RootState } from "@editor/store";
import { useAppStore } from "@editor/store";
import GroupIcon from "@ff-client/assets/icons/fields/group";
import PageIcon from "@ff-client/assets/icons/fields/page";
import { useSiteContext } from "@ff-client/contexts/site/site.context";
import { useFieldTypeSearch } from "@ff-client/queries/field-types";
import type { OptionCollection } from "@ff-client/types/properties";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { layoutSelectors } from "../layouts/layouts.selectors";
import { pageSelecors } from "../pages/pages.selectors";
import type { Field } from ".";

export const useFieldOptionCollection = (
  excludedUids?: string[],
  excludedTypes?: string[],
): OptionCollection => {
  const { getState } = useAppStore();
  const findType = useFieldTypeSearch();
  const { current: currentSite } = useSiteContext();

  const cartographed = useSelector(layoutSelectors.cartographed.pageFieldList);
  const pages = useSelector(pageSelecors.all);
  const fieldTranslations = useSelector(
    (state: RootState) => state.translations?.[currentSite?.id]?.fields,
  );

  return useMemo((): OptionCollection => {
    const mapField = (
      field: Field,
      ancestors = new Set<string>(),
    ): OptionCollection[number] | null => {
      if (ancestors.has(field.uid) || excludedUids?.includes(field.uid))
        return null;
      const type = findType(field.typeClass);
      if (excludedTypes?.includes(type?.type)) return null;
      const label =
        (fieldTranslations?.[field.uid]?.label as string | undefined) ??
        field.properties.label;
      if (["group", "layout", "layout-column"].includes(type?.type)) {
        const visited = new Set(ancestors).add(field.uid);
        return {
          label,
          icon: <GroupIcon />,
          children: layoutSelectors.cartographed
            .layoutFieldList(getState(), field.properties.layout)
            .map((child) => mapField(child, visited))
            .filter(Boolean),
        };
      }
      return { value: field.uid, label };
    };
    return cartographed.map((mapped) => ({
      label: pages.find((page) => page.uid === mapped.page)?.label,
      icon: <PageIcon />,
      children: mapped.fields.map((field) => mapField(field)).filter(Boolean),
    }));
  }, [
    cartographed,
    pages,
    excludedUids,
    excludedTypes,
    findType,
    getState,
    fieldTranslations,
  ]);
};
