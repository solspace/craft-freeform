import type { ChangeEvent } from 'react';
import React from 'react';
import { Control } from '@components/form-controls/control';
import {
  FormTagAttributeInputColumn,
  FormTagAttributeInputRow,
  FormTagAttributeInputWrapper,
} from '@components/form-controls/inputs/form-tag-attribute-input.styles';
import type {
  FormTagAttributeInputProps,
  FormTagAttributeProps,
} from '@ff-client/types/properties';

export const FormTagAttributeInput: React.FC<FormTagAttributeInputProps> = ({
  id,
  value,
  onChange,
}) => {
  /**
   * Adds blank/empty key/value object
   */
  const addFormTagAttribute = (): void => {
    const formTagAttributes = [
      ...value,
      {
        key: '',
        value: '',
      },
    ];

    if (onChange) {
      onChange(formTagAttributes);
    }
  };

  /**
   * Filters out the form tag attribute based on its index
   * @param formTagAttributeIndex
   */
  const deleteFormTagAttribute = (formTagAttributeIndex: number): void => {
    let formTagAttributes = JSON.parse(JSON.stringify(value));

    formTagAttributes = formTagAttributes.filter(
      (formTagAttribute: FormTagAttributeProps, index: number) =>
        index !== formTagAttributeIndex
    );

    if (onChange) {
      onChange(formTagAttributes);
    }
  };

  /**
   * Find and update attribute property value
   * @param payload
   */
  const updateFormTagAttribute = (payload: FormTagAttributeProps): void => {
    const formTagAttributes = JSON.parse(JSON.stringify(value));

    formTagAttributes.forEach(
      (formTagAttribute: FormTagAttributeProps, index: number) => {
        if (index === payload.index) {
          if (payload.key === 'key') {
            formTagAttribute['key'] = String(payload.value);
          } else if (!isNaN(Number(payload.value))) {
            // If the value is a numeric string convert to a proper number
            formTagAttribute['value'] = Number(payload.value);
          } else if (payload.value === 'true') {
            // If the value is a boolean string "true", convert to a proper number
            formTagAttribute['value'] = true;
          } else if (payload.value === 'false') {
            // If the value is a boolean string "false", convert to a proper number
            formTagAttribute['value'] = false;
          } else {
            formTagAttribute['value'] = payload.value;
          }
        }
      }
    );

    if (onChange) {
      onChange(formTagAttributes);
    }
  };

  return (
    <FormTagAttributeInputWrapper>
      {value.map(({ key, value }: FormTagAttributeProps, index: number) => (
        <FormTagAttributeInputRow key={index}>
          <FormTagAttributeInputColumn>
            <Control id={`${id}[${index}]['key']`} label="Key">
              <input
                id={`${id}[${index}]['key']`}
                type="text"
                placeholder={`data-example-${index + 1}`}
                className="text fullwidth"
                defaultValue={(key as string) || ''}
                onChange={(event: ChangeEvent<HTMLInputElement>): void =>
                  updateFormTagAttribute({
                    index,
                    key: 'key',
                    value: String(event.target.value),
                  })
                }
              />
            </Control>
          </FormTagAttributeInputColumn>
          <FormTagAttributeInputColumn>
            <Control id={`${id}[${index}]['value']`} label="Value">
              <input
                id={`${id}[${index}]['value']`}
                type="text"
                placeholder={`test-${index + 1}`}
                className="text fullwidth"
                defaultValue={(value as string | number) || ''}
                onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                  updateFormTagAttribute({
                    index,
                    key: 'value',
                    value: event.target.value,
                  });
                }}
              />
            </Control>
          </FormTagAttributeInputColumn>
          <FormTagAttributeInputColumn style={{ width: '150px' }}>
            <Control label="&nbsp;">
              <button
                type="button"
                className="btn submit"
                onClick={(): void =>
                  deleteFormTagAttribute && deleteFormTagAttribute(index)
                }
              >
                Delete
              </button>
            </Control>
          </FormTagAttributeInputColumn>
        </FormTagAttributeInputRow>
      ))}
      <FormTagAttributeInputRow>
        <button type="button" className="btn" onClick={addFormTagAttribute}>
          Add&nbsp;+
        </button>
      </FormTagAttributeInputRow>
    </FormTagAttributeInputWrapper>
  );
};
