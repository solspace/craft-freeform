import React from 'react';
import { Control } from '@components/form-controls/control';
import {
  Column,
  ColumnNarrow,
  Row,
  Wrapper,
} from '@components/form-controls/inputs/form-tag-attribute-input.styles';
import type { Attribute } from '@ff-client/types/forms';

export type AttributeInput = {
  id: string;
  value: Attribute[] | [];
  onChange: (value: Attribute[]) => void;
};

export const FormTagAttributeInput: React.FC<AttributeInput> = ({
  id,
  value,
  onChange,
}) => {
  /**
   * Adds blank/empty key/value object
   */
  const addAttribute = (): void => {
    const attributes = [
      ...value,
      {
        key: '',
        value: '',
      },
    ];

    if (onChange) {
      onChange(attributes);
    }
  };

  /**
   * Filters out the form tag attribute based on its index
   * @param attributeIndex
   */
  const deleteAttribute = (attributeIndex: number): void => {
    let attributes = JSON.parse(JSON.stringify(value));

    attributes = attributes.filter(
      (attribute: Attribute, index: number) => index !== attributeIndex
    );

    if (onChange) {
      onChange(attributes);
    }
  };

  /**
   * Find and update attribute property value
   * @param payload
   */
  const updateAttribute = (payload: Attribute): void => {
    const attributes = JSON.parse(JSON.stringify(value));

    attributes.forEach((attribute: Attribute, index: number) => {
      if (index === payload.index) {
        if (payload.key === 'key') {
          attribute['key'] = payload.value;
        } else {
          attribute['value'] = payload.value;
        }
      }
    });

    if (onChange) {
      onChange(attributes);
    }
  };

  return (
    <Wrapper>
      {value.map(({ key, value }: Attribute, index: number) => {
        const keyId = `${id}[${index}]['key']`;
        const valueId = `${id}[${index}]['value']`;

        return (
          <Row key={index}>
            <Column>
              <Control id={keyId} label="Key">
                <input
                  id={keyId}
                  type="text"
                  placeholder={`data-example-${index + 1}`}
                  className="text fullwidth"
                  defaultValue={(key as string) || ''}
                  onChange={(event) =>
                    updateAttribute({
                      index,
                      key: 'key',
                      value: event.target.value,
                    })
                  }
                />
              </Control>
            </Column>
            <Column>
              <Control id={valueId} label="Value">
                <input
                  id={valueId}
                  type="text"
                  placeholder={`test-${index + 1}`}
                  className="text fullwidth"
                  defaultValue={(value as string) || ''}
                  onChange={(event) =>
                    updateAttribute({
                      index,
                      key: 'value',
                      value: event.target.value,
                    })
                  }
                />
              </Control>
            </Column>
            <ColumnNarrow>
              <Control label="&nbsp;">
                <button
                  type="button"
                  className="btn submit"
                  onClick={() => deleteAttribute(index)}
                >
                  Delete
                </button>
              </Control>
            </ColumnNarrow>
          </Row>
        );
      })}
      <Row>
        <button type="button" className="btn" onClick={addAttribute}>
          Add&nbsp;+
        </button>
      </Row>
    </Wrapper>
  );
};
