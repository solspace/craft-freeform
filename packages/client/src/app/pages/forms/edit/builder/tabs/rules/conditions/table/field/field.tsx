import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { useAppStore } from '@editor/store';
import { layoutSelectors } from '@editor/store/slices/layout/layouts/layouts.selectors';
import { pageSelecors } from '@editor/store/slices/layout/pages/pages.selectors';
import { useFieldTypeSearch } from '@ff-client/queries/field-types';
import type { OptionCollection } from '@ff-client/types/properties';
import type { Condition } from '@ff-client/types/rules';
import translate from '@ff-client/utils/translations';

import PageIcon from '../../../sidebar/page/page-icon.svg';
type Props = {
  condition: Condition;
  onChange: (fieldUid: string) => void;
};

import GroupFieldIcon from './group-field.svg';

export const FieldSelect: React.FC<Props> = ({ condition, onChange }) => {
  const { uid } = useParams();
  const { getState } = useAppStore();
  const findType = useFieldTypeSearch();

  const cartographed = useSelector(layoutSelectors.cartographed.pageFieldList);
  const pages = useSelector(pageSelecors.all);

  const options = useMemo(
    (): OptionCollection =>
      cartographed.map((mapped) => ({
        label: pages.find((page) => page.uid === mapped.page)?.label,
        icon: <PageIcon />,
        children: mapped.fields
          .map((field) => {
            if (field.uid === uid) {
              return null;
            }

            const type = findType(field.typeClass);
            if (type?.type === 'group') {
              const fields = layoutSelectors.cartographed.layoutFieldList(
                field.properties.layout
              )(getState());

              return {
                label: field.properties.label,
                icon: <GroupFieldIcon />,
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
    [cartographed, pages, uid]
  );

  return (
    <div className="select fullwidth">
      <Dropdown
        options={options}
        emptyOption={translate('Choose field')}
        value={condition.field}
        onChange={onChange}
      />
    </div>
  );
};
