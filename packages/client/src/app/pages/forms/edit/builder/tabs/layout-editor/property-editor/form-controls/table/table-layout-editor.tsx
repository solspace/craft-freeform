import React, { useEffect } from 'react';
import { Wrapper } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/table/table-editor-layout.styles';
import {
  addOption,
  deleteOption,
  dragAndDropOption,
  updateOption,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/table/table-layout-editor.operations';
import type { Option } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/table/table-layout-editor.types';
import {
  Button,
  Cell,
  DeleteIcon,
  DragIcon,
  Input,
  Row,
  Select,
  TabularOptions,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/tabular.styles';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import type { Option as PropertyOption } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

type Props = {
  handle: string;
  types: PropertyOption[];
  options: Option[];
  onChange: (value: Option[]) => void;
};

const TableLayoutEditor: React.FC<Props> = ({
  handle,
  types,
  options,
  onChange,
}) => {
  useEffect(() => {
    if (options.length === 0) {
      addOption(options, onChange);
    }
  }, [options]);

  useOnKeypress(
    {
      callback: (event: KeyboardEvent): void => {
        if (event.key === 'Enter') {
          addOption(options, onChange);
        }
      },
    },
    [options]
  );

  return (
    <Wrapper>
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
                    options,
                    onChange
                  )
                }
              />
            </Cell>
            <Cell>
              <Select
                defaultValue={option.type}
                title={translate('Type')}
                id={`${handle}[${index}]['type']`}
                onChange={(event) =>
                  updateOption(
                    index,
                    {
                      ...option,
                      type: event.target.value,
                    },
                    options,
                    onChange
                  )
                }
              >
                <option value="" label="Choose Type" />
                {Object.values(types).map(({ value, label }) => (
                  <option key={value} value={value} label={label} />
                ))}
              </Select>
            </Cell>
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
                    options,
                    onChange
                  )
                }
              />
            </Cell>
            <Cell className="drag-and-drop">
              <Button
                disabled={options.length === 1}
                onClick={() => dragAndDropOption(index, options, onChange)}
              >
                <DragIcon />
              </Button>
            </Cell>
            <Cell className="delete">
              <Button
                disabled={options.length === 1}
                onClick={() => deleteOption(index, options, onChange)}
              >
                <DeleteIcon />
              </Button>
            </Cell>
          </Row>
        ))}
      </TabularOptions>
    </Wrapper>
  );
};

export default TableLayoutEditor;
