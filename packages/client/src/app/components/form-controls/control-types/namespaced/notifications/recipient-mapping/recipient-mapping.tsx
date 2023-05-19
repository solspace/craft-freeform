import React from 'react';
import { useSelector } from 'react-redux';
import { Control } from '@components/form-controls/control';
import type { Option } from '@components/form-controls/control-types/options/options.types';
import { Source } from '@components/form-controls/control-types/options/options.types';
import type { ControlType } from '@components/form-controls/types';
import { fieldSelectors } from '@editor/store/slices/fields/fields.selectors';
import { useFieldType } from '@ff-client/queries/field-types';
import type { Notification } from '@ff-client/types/notifications';
import { RecipientMapping } from '@ff-client/types/notifications';
import type { RecipientMappingProperty } from '@ff-client/types/properties';
import { PropertyType } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import { RecipientMappingBlock } from './block/block';
import { MappingOption } from './mapping.option';
import { RecipientMappingWrapper } from './recipient-mapping.styles';

const RecipientMapping: React.FC<
  ControlType<RecipientMappingProperty, Notification>
> = ({ value, property, errors, updateValue, context }) => {
  const fieldUid = context.field as string;
  const field = useSelector(fieldSelectors.one(fieldUid));
  const fieldType = useFieldType(field?.typeClass);

  const optionsProperty = fieldType?.properties?.find(
    (property) => property.type === PropertyType.Options
  );

  let options: Option[] = [];
  if (optionsProperty) {
    const properties = field.properties[optionsProperty.handle];
    if (properties.source === Source.CustomOptions) {
      options = (properties.options as Option[]).filter(
        (option) => option.value !== ''
      );
    }
  }

  const findMapping = (entryValue: string): RecipientMapping | undefined => {
    return value?.find((mapping) => mapping.value === entryValue);
  };

  return (
    <Control property={property} errors={errors}>
      <RecipientMappingWrapper>
        {!!optionsProperty &&
          options.map((option, idx) => (
            <MappingOption
              key={idx}
              option={option}
              mapping={findMapping(option.value)}
              allMappings={value}
              updateValue={updateValue}
            />
          ))}

        {!!value &&
          value.map((mapping, idx) => {
            if (options.find((option) => option.value === mapping.value)) {
              return null;
            }

            return (
              <RecipientMappingBlock
                key={idx}
                mapping={mapping}
                onRemove={() => {
                  updateValue([
                    ...value.slice(0, idx),
                    ...value.slice(idx + 1),
                  ]);
                }}
                onChange={(newValue) => {
                  updateValue([
                    ...value.slice(0, idx),
                    newValue,
                    ...value.slice(idx + 1),
                  ]);
                }}
              />
            );
          })}

        <button
          className={classes('btn', 'add', 'icon', 'dashed')}
          onClick={() =>
            updateValue([...value, { value: '', recipients: [], template: '' }])
          }
        >
          {translate('Add a custom value')}
        </button>
      </RecipientMappingWrapper>
    </Control>
  );
};

export default RecipientMapping;
