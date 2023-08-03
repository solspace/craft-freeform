import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { layoutSelectors } from '@editor/store/slices/layout/layouts/layouts.selectors';
import { pageSelecors } from '@editor/store/slices/layout/pages/pages.selectors';
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

  return (
    <div className="select fullwidth">
      <Dropdown
        selectedValue="nested-field3"
        options={[
          { label: 'Choose field', value: '' },
          { label: 'Asbestos', value: 'asbestos' },
          { label: 'Siria', value: 'siria' },
          {
            label: 'Nested Group',
            children: [
              { label: 'Tank', value: 'nested-field1' },
              { label: 'Jumanji Tank Specops', value: 'nested-field2' },
              {
                label: 'Sub nested group',
                children: [
                  { label: 'Jumping jacks', value: 'sub-nested-field1' },
                  { label: 'Telemetry', value: 'sub-nested-2' },
                ],
              },
              {
                label: 'Sub nested group',
                children: [
                  { label: 'Jumping jacks', value: 'sub-nested-field1' },
                  { label: 'Telemetry', value: 'sub-nested-2' },
                  {
                    label: 'Sub Sub nested group',
                    children: [
                      { label: 'Jumping jacks', value: 'sub-nested-field1' },
                      { label: 'Telemetry', value: 'sub-nested-2' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            label: 'Nested group 2',
            children: [
              { label: 'Tenacious D', value: 'nested-field3' },
              { label: 'Sin City', value: 'nested-field4' },
              {
                label: 'Sub nested group',
                children: [
                  { label: 'Jumping jacks', value: 'sub-nested-field1' },
                  { label: 'Telemetry', value: 'sub-nested-2' },
                ],
              },
            ],
          },
        ]}
      />

      <br />
      <select
        value={condition.field}
        onChange={(event) => onChange && onChange(event.target.value)}
      >
        <option value="">{translate('Choose field')}</option>
        {cartographed.map((mapped) => (
          <optgroup
            key={mapped.page}
            label={pages.find((page) => page.uid === mapped.page)?.label}
          >
            {mapped.fields.map((field) => {
              if (field.uid === uid) {
                return null;
              }

              return (
                <option key={field.uid} value={field.uid}>
                  {field.properties.label}
                </option>
              );
            })}
          </optgroup>
        ))}
      </select>
    </div>
  );
};
