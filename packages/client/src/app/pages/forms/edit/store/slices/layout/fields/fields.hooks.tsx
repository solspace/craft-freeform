import React from 'react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useAppStore } from '@editor/store';
import GroupIcon from '@ff-client/assets/icons/fields/group.svg';
import PageIcon from '@ff-client/assets/icons/fields/page.svg';
import { useFieldTypeSearch } from '@ff-client/queries/field-types';
import type { OptionCollection } from '@ff-client/types/properties';

import { layoutSelectors } from '../layouts/layouts.selectors';
import { pageSelecors } from '../pages/pages.selectors';

export const useFieldOptionCollection = (
  excludedUids?: string[]
): OptionCollection => {
  const { getState } = useAppStore();
  const findType = useFieldTypeSearch();

  const cartographed = useSelector(layoutSelectors.cartographed.pageFieldList);
  const pages = useSelector(pageSelecors.all);

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
            if (type?.type === 'group') {
              const fields = layoutSelectors.cartographed.layoutFieldList(
                getState(),
                field.properties.layout
              );

              return {
                label: field.properties.label,
                icon: <GroupIcon />,
                children: fields.map((subField) => ({
                  label: subField.properties.label,
                  value: subField.uid,
                })),
              };
            }

            return {
              value: field.uid,
              label: field.properties.label,
            };
          })
          .filter(Boolean),
      })),
    [cartographed, pages, excludedUids]
  );
};
