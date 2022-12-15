import React, { useEffect, useState } from 'react';
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
  autofocus?: boolean;
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
  const enterKeyPress = useKeyPress('Enter');

  /**
   * Adds blank label/value object
   */
  const addOption = (): void => {
    const options = value.options ? [...value.options] : [];

    options.push({
      label: '',
      value: '',
      default: false,
      autofocus: true,
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
   * @param payload
   */
  const updateOption = (payload: PayloadProp): void => {
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

  // Add new option when the enter key is pressed
  useEffect(() => {
    if (enterKeyPress) {
      addOption();
    }
  }, [enterKeyPress]);

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
              onChange={() =>
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
                value.options.map((option: OptionProp, index: number) => (
                  <tr key={index}>
                    <td>
                      <Input
                        id={`${handle}[${index}]['label']`}
                        type="text"
                        placeholder=""
                        className="text"
                        value={(option.label as string) || ''}
                        autoFocus={option.autofocus}
                        onChange={(event) => {
                          updateOption({
                            index,
                            key: 'label',
                            value: event.target.value,
                          });
                        }}
                      />
                    </td>
                    {value.useCustomValues && (
                      <td>
                        <Input
                          id={`${handle}[${index}]['value']`}
                          type="text"
                          placeholder=""
                          className="text"
                          value={(option.value as string) || ''}
                          onChange={(event) =>
                            updateOption({
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
                        id={`${handle}[${index}]['default']`}
                        checked={(option.default as boolean) || false}
                        onChange={() =>
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
                ))}
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

/**
 * Helper function that listens for key down and key up events
 * Set internal state to true or false when the target key is pressed.
 *
 * @param targetKey
 */
const useKeyPress = (targetKey: string): boolean => {
  const [keyPressed, setKeyPressed] = useState<boolean>(false);

  // If the pressed key is our target key then set to true
  const keyDownHandler = (event: KeyboardEvent): void => {
    if (event.key === targetKey) {
      setKeyPressed(true);
    }
  };

  // If the released key is our target key then set to false
  const keyUpHandler = (event: KeyboardEvent): void => {
    if (event.key === targetKey) {
      setKeyPressed(false);
    }
  };

  // Add event listeners
  useEffect(() => {
    window.addEventListener('keyup', keyUpHandler);
    window.addEventListener('keydown', keyDownHandler);

    // Remove event listeners as cleanup
    return () => {
      window.removeEventListener('keyup', keyUpHandler);
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, []);

  return keyPressed;
};

export default CustomOptions;
