import type { ChangeEvent } from 'react';
import React from 'react';
import { Control } from '@ff-client/app/components/form-controls/control';
import { FormTagAttributeWrapper } from '@ff-client/app/pages/forms/edit/builder/tabs/settings/field-layout.styles';
import type { FormTagAttributeHandlerProps } from '@ff-client/types/properties';

export const FormTagAttribute = (
  props: FormTagAttributeHandlerProps
): JSX.Element => {
  const { index, attributeKey, attributeValue, onDeleteField, onChangeField } =
    props;

  return (
    <FormTagAttributeWrapper key={index}>
      <div className="input-wrapper">
        <Control label="Key" id={`formTagAttribute[${index}]['key']`}>
          <input
            id={`formTagAttribute[${index}]['key']`}
            type="text"
            placeholder={`data-example-${index + 1}`}
            className="text fullwidth"
            defaultValue={(attributeKey as string) || ''}
            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
              if (event.target.value) {
                onChangeField &&
                  onChangeField({
                    index,
                    key: 'key',
                    value: String(event.target.value),
                  });
              }
            }}
          />
        </Control>
      </div>
      <div className="input-wrapper">
        <Control label="Value" id={`formTagAttribute[${index}]['value']`}>
          <input
            id={`formTagAttribute[${index}]['value']`}
            type="text"
            placeholder={`test-${index + 1}`}
            className="text fullwidth"
            defaultValue={(attributeValue as string | number) || ''}
            onChange={(event: ChangeEvent<HTMLInputElement>): void => {
              if (event.target.value) {
                let value: string | number = event.target.value;

                // If the value is a numeric string convert to a proper number
                if (!isNaN(Number(value))) {
                  value = Number(value);
                }

                // If the value is a boolean string "true", convert to a proper number
                if (value === 'true') {
                  value = 1;
                }

                // If the value is a boolean string "false", convert to a proper number
                if (value === 'false') {
                  value = 0;
                }

                onChangeField &&
                  onChangeField({
                    index,
                    value,
                    key: 'value',
                  });
              }
            }}
          />
        </Control>
      </div>
      <div className="button-wrapper">
        <Control label="&nbsp;" id={`formTagAttribute[${index}]['value']`}>
          <button
            type="button"
            className="btn submit"
            onClick={(): void => onDeleteField && onDeleteField(index)}
          >
            Delete
          </button>
        </Control>
      </div>
    </FormTagAttributeWrapper>
  );
};
