import React from 'react';
import {
  addOption,
  deleteOption,
  dragAndDropOption,
  updateOption,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/table-layout-editor.operations';
import {
  Column,
  Row,
  Wrapper,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/table-layout-editor.styles';
import type { Option } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/table-layout-editor.types';
import {
  AddOptionIcon,
  Button,
  DeleteIcon,
  DragIcon,
  Input,
  Select,
  TableAddOption,
  TableOptions,
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
  useOnKeypress({
    callback: (event: KeyboardEvent): void => {
      if (event.key === 'Enter') {
        addOption(options, onChange);
      }
    },
  });

  return (
    <Wrapper>
      <Row>
        <Column>
          <TableOptions>
            <thead>
              <tr>
                <td>{translate('Label')}</td>
                <td>{translate('Type')}</td>
                <td>{translate('Value')}</td>
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
                          options,
                          onChange
                        )
                      }
                    />
                  </td>
                  <td>
                    <Select
                      id={`${handle}[${index}]['type']`}
                      defaultValue={option.label}
                      className="text fullwidth"
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
                      {Object.values(types).map(({ value, label }) => (
                        <option key={value} value={value} label={label} />
                      ))}
                    </Select>
                  </td>
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
                          options,
                          onChange
                        )
                      }
                    />
                  </td>
                  <td className="drag-and-drop-cell">
                    <Button
                      onClick={() =>
                        dragAndDropOption(index, options, onChange)
                      }
                    >
                      <DragIcon />
                    </Button>
                  </td>
                  <td className="delete-cell">
                    <Button
                      onClick={() => deleteOption(index, options, onChange)}
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
                  <Button onClick={() => addOption(options, onChange)}>
                    <AddOptionIcon />
                    {translate('Add...')}
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

export default TableLayoutEditor;
