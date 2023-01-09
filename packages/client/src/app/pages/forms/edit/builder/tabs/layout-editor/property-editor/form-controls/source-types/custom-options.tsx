import React from 'react';
import { CheckboxInput } from '@components/form-controls/inputs/checkbox-input';
import {
  addOption,
  deleteOption,
  dragAndDropOption,
  updateChecked,
  updateOption,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/source-types/custom-options.operations';
import {
  Column,
  H3,
  Row,
  Wrapper,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/source-types/custom-options.styles';
import { CustomOptions } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/source-types/custom-options.types';
import {
  AddOptionIcon,
  Button,
  CheckboxWrapper,
  DeleteIcon,
  DragIcon,
  Input,
  TableAddOption,
  TableOptions,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/tabular.styles';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import translate from '@ff-client/utils/translations';

type Props = {
  handle: string;
  value: CustomOptions;
  onChange: (value: CustomOptions) => void;
};

const CustomOptions: React.FC<Props> = ({ handle, value, onChange }) => {
  const options = value?.options || [];
  const useCustomValues = value?.useCustomValues || false;

  useOnKeypress({
    callback: (event: KeyboardEvent): void => {
      if (event.key === 'Enter') {
        addOption(options, value, onChange);
      }
    },
  });

  return (
    <Wrapper>
      <Row>
        <Column>
          <H3>{translate('Options')}</H3>
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
                <td>{translate('Label')}</td>
                {useCustomValues && <td>{translate('Value')}</td>}
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
                  <Button onClick={() => addOption(options, value, onChange)}>
                    <AddOptionIcon />
                    {translate('Add an option')}
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
