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

  return useMemo(
    (): OptionCollection =>
      cartographed.map((mapped) => ({
        label: pages.find((page) => page.uid === mapped.page)?.label,
        icon: <PageIcon />,
        children: mapped.fields
          .map((field) => {
            if (excludedUids?.includes(field.uid)) {
              return null;
            }

            const type = findType(field.typeClass);

            if (excludedTypes?.includes(type?.type)) {
              return null;
            }

            const fieldLabel =
              (fieldTranslations?.[field.uid]?.label as string | undefined) ??
              field.properties.label;

            if (type?.type === "group") {
              const fields = layoutSelectors.cartographed.layoutFieldList(
                getState(),
                field.properties.layout,
              );

              return {
                label: fieldLabel,
                icon: <GroupIcon />,
                children: fields.map((subField) => ({
                  label:
                    (fieldTranslations?.[subField.uid]?.label as
                      | string
                      | undefined) ?? subField.properties.label,
                  value: subField.uid,
                })),
              };
            }

            return {
              value: field.uid,
              label: fieldLabel,
            };
          })
          .filter(Boolean),
      })),
    [
      cartographed,
      pages,
      excludedUids,
      excludedTypes,
      findType,
      getState,
      fieldTranslations,
    ],
  );
};
