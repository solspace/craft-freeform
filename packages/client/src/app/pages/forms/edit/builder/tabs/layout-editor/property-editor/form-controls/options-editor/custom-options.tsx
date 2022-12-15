import React from 'react';
import {
  AddOptionButton,
  CheckboxWrapper,
  Column,
  DeleteButton,
  DeleteIcon,
  DragButton,
  DragIcon,
  H3,
  Input,
  PlusIcon,
  Row,
  TableAddOption,
  TableOptions,
  Wrapper,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options-editor/custom-options.styles';
import { CheckboxInput } from '@ff-client/app/components/form-controls/inputs/checkbox-input';
import type { GenericValue } from '@ff-client/types/properties';

type OptionProp = {
  label: string;
  value: string;
  default: boolean;
};

type PayloadProp = {
  index: number;
  key: string;
  value: string | boolean;
};

export type CustomOptionsProps = {
  useCustomValues: boolean;
  options: OptionProp[] | GenericValue[];
};

type Props = {
  handle: string;
  value: CustomOptionsProps | GenericValue;
  onChange?: (customOptions: CustomOptionsProps) => void;
};

const CustomOptions: React.FC<Props> = ({ handle, value, onChange }) => {
  /**
   * Adds blank label/value object
   */
  const addOption = (): void => {
    const options = value.options ? [...value.options] : [];

    options.push({
      label: '',
      value: '',
      default: false,
    });

    if (onChange) {
      onChange({
        ...value,
        options,
      });
    }
  };

  /**
   * Filters out the option based on its index
   * @param optionIndex
   */
  const deleteOption = (optionIndex: number): void => {
    let options = JSON.parse(JSON.stringify(value.options));

    options = options.filter(
      (option: OptionProp, index: number) => index !== optionIndex
    );

    if (onChange) {
      onChange({
        ...value,
        options,
      });
    }
  };

  const dragAndDropOption = (optionIndex: number): void => {
    // TODO: Implement DnD once we have added DnD functionality elsewhere
  };

  /**
   * Find and update option property value
   * @param event
   * @param payload
   */
  const updateOption = (event, payload: PayloadProp): void => {
    /**
     * Add a new option row upon pressing enter key in any text input field
     * @param event
     */
    if (event.key === 'Enter') {
      addOption();

      return;
    }

    const options = JSON.parse(JSON.stringify(value.options));

    options.forEach((option: OptionProp, index: number) => {
      if (index === payload.index) {
        if (payload.key === 'label') {
          option['label'] = String(payload.value);

          if (!value.useCustomValues) {
            option['value'] = String(payload.value);
          }
        } else if (payload.key === 'value') {
          option['value'] = String(payload.value);
        } else {
          // Unsets for all other options
          options.forEach(
            (otherOption: OptionProp) => (otherOption.default = false)
          );

          // Sets the current option
          option['default'] = Boolean(payload.value);
        }
      }
    });

    if (onChange) {
      onChange({
        ...value,
        options,
      });
    }
  };

  return (
    <Wrapper>
      <Row>
        <Column>
          <H3>Options</H3>
          <CheckboxWrapper>
            <CheckboxInput
              id="useCustomValues"
              label="Use custom values"
              checked={(value.useCustomValues as boolean) || false}
              onClick={() =>
                onChange &&
                onChange({
                  ...value,
                  useCustomValues: !value.useCustomValues,
                })
              }
            />
          </CheckboxWrapper>
        </Column>
      </Row>
      <Row>
        <Column>
          <TableOptions>
            <thead>
              <tr>
                <td>Label</td>
                {value.useCustomValues && <td>Value</td>}
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {value.options &&
                value.options.map((option: OptionProp, index: number) => {
                  const labelId = `${handle}[${index}]['label']`;
                  const valueId = `${handle}[${index}]['value']`;
                  const defaultId = `${handle}[${index}]['default']`;

                  return (
                    <tr key={index}>
                      <td>
                        <Input
                          id={labelId}
                          type="text"
                          placeholder=""
                          className="text"
                          value={(option.label as string) || ''}
                          onChange={(event) =>
                            updateOption(event, {
                              index,
                              key: 'label',
                              value: event.target.value,
                            })
                          }
                        />
                      </td>
                      {value.useCustomValues && (
                        <td>
                          <Input
                            id={valueId}
                            type="text"
                            placeholder=""
                            className="text"
                            value={(option.value as string) || ''}
                            onChange={(event) =>
                              updateOption(event, {
                                index,
                                key: 'value',
                                value: event.target.value,
                              })
                            }
                          />
                        </td>
                      )}
                      <td>
                        <Input
                          type="checkbox"
                          id={defaultId}
                          checked={option.default}
                          onClick={() =>
                            updateOption({
                              index,
                              key: 'default',
                              value: !option.default,
                            })
                          }
                        />
                      </td>
                      <td>
                        <DragButton onClick={() => dragAndDropOption(index)}>
                          <DragIcon />
                        </DragButton>
                      </td>
                      <td>
                        <DeleteButton onClick={() => deleteOption(index)}>
                          <DeleteIcon />
                        </DeleteButton>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </TableOptions>
          <TableAddOption>
            <tbody>
              <tr>
                <td>
                  <AddOptionButton onClick={addOption}>
                    <PlusIcon />
                    Add an option
                  </AddOptionButton>
                </td>
              </tr>
            </tbody>
          </TableAddOption>
        </Column>
      </Row>
    </Wrapper>
  );
};

export default CustomOptions;
