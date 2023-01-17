import React, { useEffect } from 'react';
import { CheckboxInput } from '@components/form-controls/inputs/checkbox-input';
import {
  addOption,
  deleteOption,
  dragAndDropOption,
  updateChecked,
  updateOption,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options/custom-options.operations';
import {
  CustomOptionsWrapper,
  H3,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options/custom-options.styles';
import { CustomOptions } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options/custom-options.types';
import {
  Button,
  Cell,
  CheckboxWrapper,
  DeleteIcon,
  DragIcon,
  Input,
  Row,
  TabularOptions,
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

  useEffect(() => {
    if (options.length === 0) {
      addOption(options, value, onChange);
    }
  }, [options]);

  useOnKeypress(
    {
      callback: (event: KeyboardEvent): void => {
        if (event.key === 'Enter') {
          addOption(options, value, onChange);
        }
      },
    },
    [options]
  );

  return (
    <CustomOptionsWrapper>
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
      <TabularOptions>
        {options.map((option, index) => (
          <Row key={index}>
            <Cell>
              <Input
                type="text"
                value={option.label}
                id={`${handle}[${index}]['label']`}
                placeholder={translate('Label')}
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
            </Cell>
            {useCustomValues && (
              <Cell>
                <Input
                  type="text"
                  value={option.value}
                  id={`${handle}[${index}]['value']`}
                  placeholder={translate('Value')}
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
              </Cell>
            )}
            <Cell className="check">
              <CheckboxInput
                label=""
                checked={option.checked}
                id={`${handle}[${index}]['checked']`}
                onChange={() =>
                  updateChecked(
                    index,
                    {
                      ...option,
                      checked: !option.checked,
                    },
                    value,
                    onChange
                  )
                }
              />
            </Cell>
            <Cell className="drag-and-drop">
              <Button
                disabled={options.length === 1}
                onClick={() => dragAndDropOption(index, value, onChange)}
              >
                <DragIcon />
              </Button>
            </Cell>
            <Cell className="delete">
              <Button
                disabled={options.length === 1}
                onClick={() => deleteOption(index, value, onChange)}
              >
                <DeleteIcon />
              </Button>
            </Cell>
          </Row>
        ))}
      </TabularOptions>
    </CustomOptionsWrapper>
  );
};

export default CustomOptions;
