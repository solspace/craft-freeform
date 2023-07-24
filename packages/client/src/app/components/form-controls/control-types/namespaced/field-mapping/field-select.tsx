import React from 'react';
import { useSelector } from 'react-redux';
import { fieldSelectors } from '@editor/store/slices/fields/fields.selectors';
import { layoutSelectors } from '@editor/store/slices/layout/layouts/layouts.selectors';
import { pageSelecors } from '@editor/store/slices/layout/pages/pages.selectors';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import { DropDown } from './field-select.styles';

type Props = {
  value: string;
  onChange: (fieldUid: string) => void;
};

export const FieldSelect: React.FC<Props> = ({ value, onChange }) => {
  const cartographed = useSelector(layoutSelectors.cartographed.pageFieldList);
  const pages = useSelector(pageSelecors.all);
  const fields = useSelector(fieldSelectors.all);

  return (
    <div className="select small fullwidth">
      <DropDown
        value={value}
        className={classes(!value && 'empty')}
        onChange={(event) => onChange && onChange(event.target.value)}
      >
        <option value="">{translate('Do not map this field')}</option>
        {cartographed.map((mapped) => (
          <optgroup
            key={mapped.page}
            label={pages.find((page) => page.uid === mapped.page)?.label}
          >
            {mapped.fields.map((fieldUid) => {
              const field = fields.find((field) => field.uid === fieldUid);

              return (
                <option key={fieldUid} value={fieldUid}>
                  {field?.properties?.label}
                </option>
              );
            })}
          </optgroup>
        ))}
      </DropDown>
    </div>
  );
};
