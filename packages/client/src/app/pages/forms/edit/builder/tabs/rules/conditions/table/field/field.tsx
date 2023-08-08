import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { layoutSelectors } from '@editor/store/slices/layout/layouts/layouts.selectors';
import { pageSelecors } from '@editor/store/slices/layout/pages/pages.selectors';
import type { OptionCollection } from '@ff-client/types/properties';
import type { Condition } from '@ff-client/types/rules';
import translate from '@ff-client/utils/translations';

type Props = {
  condition: Condition;
  onChange: (fieldUid: string) => void;
};

export const FieldSelect: React.FC<Props> = ({ condition, onChange }) => {
  const { uid } = useParams();

  const cartographed = useSelector(layoutSelectors.cartographed.pageFieldList);
  const pages = useSelector(pageSelecors.all);

  const options = useMemo(
    (): OptionCollection =>
      cartographed.map((mapped) => ({
        label: pages.find((page) => page.uid === mapped.page)?.label,
        children: mapped.fields
          .map((field) => {
            if (field.uid === uid) {
              return null;
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
