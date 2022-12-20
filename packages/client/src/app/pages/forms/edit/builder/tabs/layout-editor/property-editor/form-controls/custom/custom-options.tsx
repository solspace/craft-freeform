import React, { useRef } from 'react';
import { CheckboxInput } from '@components/form-controls/inputs/checkbox-input';
import {
  AddOptionIcon,
  Button,
  CheckboxWrapper,
  Column,
  DeleteIcon,
  DragIcon,
  H3,
  Input,
  Row,
  TableAddOption,
  TableOptions,
  Wrapper,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/custom/custom-options.styles';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';

type OptionProp = {
  label: string;
  value: string;
  checked: boolean;
};

export type CustomOptionsProps = {
  useCustomValues?: boolean;
  options?: OptionProp[];
};

type Props = {
  handle: string;
  value: CustomOptionsProps;
  onChange: (value: CustomOptionsProps) => void;
};

const addOption = (
  options: OptionProp[],
  value: CustomOptionsProps,
  onChange: (value: CustomOptionsProps) => void
): void => {
  const updatedOptions = [...options];

  updatedOptions.push({
    label: '',
    value: '',
    checked: false,
  });

  onChange({
    ...value,
    options: updatedOptions,
  });
};

const updateOption = (
  index: number,
  option: OptionProp,
  value: CustomOptionsProps,
  onChange: (value: CustomOptionsProps) => void
): void => {
  const options = [...value.options];
  options[index] = option;

  onChange({
    ...value,
    options,
  });
};

const deleteOption = (
  index: number,
  value: CustomOptionsProps,
  onChange: (value: CustomOptionsProps) => void
): void => {
  const options = value.options.filter(
    (option, optionIndex) => optionIndex !== index
  );

  onChange({
    ...value,
    options,
  });
};

const updateChecked = (
  index: number,
  option: OptionProp,
  value: CustomOptionsProps,
  onChange: (value: CustomOptionsProps) => void
): void => {
  const options = value.options.map((option) => ({
    ...option,
    checked: false,
  }));

  options[index] = option;

  onChange({
    ...value,
    options,
  });
};

const dragAndDropOption = (
  index: number,
  value: CustomOptionsProps,
  onChange: (value: CustomOptionsProps) => void
): void => {
  // TODO: Implement
};

const CustomOptions: React.FC<Props> = ({ handle, value, onChange }) => {
  const addOptionButtonRef = useRef(null);

  const options = value?.options || [];
  const useCustomValues = value?.useCustomValues || false;

  useOnKeypress({
    callback: (event: KeyboardEvent): void => {
      if (event.key === 'Enter') {
        addOptionButtonRef.current.click();
      }
    },
  });

  return (
    <Wrapper>
      <Row>
        <Column>
          <H3>Options</H3>
          <CheckboxWrapper>
            <CheckboxInput
              id="useCustomValues"
              label="Use custom values"
              checked={useCustomValues}
              onChange={() =>
                onChange({
                  ...value,
                  useCustomValues: !useCustomValues,
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
                {useCustomValues && <td>Value</td>}
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {options.map((option, index) => (
                <tr key={index}>
                  <td>
                    <Input
                      id={`${handle}[${index}]['label']`}
                      type="text"
                      placeholder=""
                      className="text"
                      value={option.label}
                      autoFocus={index + 1 === options.length}
                      onChange={(event) =>
                        updateOption(
                          index,
                          {
                            ...option,
                            label: event.target.value,
                          },
                          value,
                          onChange
                        )
                      }
                    />
                  </td>
                  {useCustomValues && (
                    <td>
                      <Input
                        id={`${handle}[${index}]['value']`}
                        type="text"
                        placeholder=""
                        className="text"
                        value={option.value}
                        onChange={(event) =>
                          updateOption(
                            index,
                            {
                              ...option,
                              value: event.target.value,
                            },
                            value,
                            onChange
                          )
                        }
                      />
                    </td>
                  )}
                  <td className="checked-cell">
                    <Input
                      type="checkbox"
                      id={`${handle}[${index}]['checked']`}
                      checked={option.checked}
                      onChange={(event) =>
                        updateChecked(
                          index,
                          {
                            ...option,
                            checked: event.target.checked,
                          },
                          value,
                          onChange
                        )
                      }
                    />
                  </td>
                  <td className="drag-and-drop-cell">
                    <Button
                      onClick={() => dragAndDropOption(index, value, onChange)}
                    >
                      <DragIcon />
                    </Button>
                  </td>
                  <td className="delete-cell">
                    <Button
                      onClick={() => deleteOption(index, value, onChange)}
                    >
                      <DeleteIcon />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableOptions>
          <TableAddOption>
            <tbody>
              <tr>
                <td>
                  <Button
                    ref={addOptionButtonRef}
                    onClick={() => addOption(options, value, onChange)}
                  >
                    <AddOptionIcon />
                    Add an option
                  </Button>
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
