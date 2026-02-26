import React, { useMemo, useState } from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { Icon } from '@components/elements/custom-dropdown/dropdown.styles';
import type { UpdateValue } from '@components/form-controls';
import { Control } from '@components/form-controls/control';
import {
  ColumnEditor,
  TableContainer,
  TableEditorWrapper,
} from '@components/form-controls/control-types/table/table.editor.styles';
import type { ColumnDescription } from '@components/form-controls/control-types/table/table.types';
import { FlexRow } from '@components/layout/blocks/flex';
import type { Field } from '@editor/store/slices/layout/fields';
import { useTranslations } from '@editor/store/slices/translations/translations.hooks';
import {
  type Option as PropertyOption,
  type TableProperty,
} from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import IconCheckbox from './editor/icon.checkbox.svg';
import IconDropdown from './editor/icon.dropdown.svg';
import IconRadio from './editor/icon.radios.svg';
import IconText from './editor/icon.text.svg';
import IconTextarea from './editor/icon.textarea.svg';
import { TableColumnTabs } from './editor/table.editor.styles';
import { TableCheckboxEditor } from './editor/table.input.checkbox';
import { TableDropdownEditor } from './editor/table.input.dropdown';
import { TableTextEditor } from './editor/table.input.text';
import { updateColumn } from './table.operations';

type Props = {
  columnTypes: PropertyOption[];
  columns: ColumnDescription[];
  updateValue: UpdateValue<ColumnDescription[]>;
  property: TableProperty;
  context: Field;
};

type ColumnType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
const typeIcons: Record<ColumnType, JSX.Element> = {
  text: <IconText />,
  textarea: <IconTextarea />,
  select: <IconDropdown />,
  radio: <IconRadio />,
  checkbox: <IconCheckbox />,
};

export const TableEditor: React.FC<Props> = ({
  columnTypes,
  columns,
  updateValue,
  property,
  context,
}) => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const { getTranslation, willTranslate } = useTranslations(context);

  const isTranslating = willTranslate(property.handle);
  const translation = getTranslation<ColumnDescription[]>(
    property.handle,
    columns
  );

  const columnValues = isTranslating ? translation : columns;
  const column = useMemo<ColumnDescription>(() => {
    return columnValues[tabIndex];
  }, [tabIndex, columnValues]);

  const typeOptions = useMemo(() => {
    return columnTypes.reduce((options, option) => {
      if (option.value in typeIcons) {
        options.push({
          ...option,
          icon: typeIcons[option.value as ColumnType],
        });
      }

      return options;
    }, [] as PropertyOption[]);
  }, [columnTypes]);

  return (
    <TableEditorWrapper>
      <TableContainer>
        <TableColumnTabs>
          {columnValues.length > 0 &&
            columnValues.map((column, index) => (
              <a
                key={index}
                className={classes(index === tabIndex && 'active')}
                onClick={() => setTabIndex(index)}
              >
                <Icon>{typeIcons[column.type as ColumnType]}</Icon>
                {translate(columnValues[index].label)}
              </a>
            ))}
        </TableColumnTabs>

        <ColumnEditor>
          <FlexRow>
            <Control width={70} label={translate('Label')} handle="label">
              <input
                type="text"
                className="text fullwidth"
                value={column.label}
                onChange={(event) =>
                  updateValue(
                    updateColumn(
                      tabIndex,
                      { ...column, label: event.target.value },
                      columnValues
                    )
                  )
                }
              />
            </Control>

            <Control width={30} label={translate('Column Type')} handle="type">
              <Dropdown
                showSelectedIcon
                emptyOption="Select Type"
                value={column.type}
                options={typeOptions}
                onChange={(value) => {
                  updateValue(
                    updateColumn(
                      tabIndex,
                      { ...column, type: value },
                      columnValues
                    )
                  );
                }}
              />
            </Control>
          </FlexRow>
          {renderCellEditor(column, (col: ColumnDescription) =>
            updateValue(updateColumn(tabIndex, col, columnValues))
          )}
        </ColumnEditor>
      </TableContainer>
    </TableEditorWrapper>
  );
};

const renderCellEditor = (
  column: ColumnDescription,
  update: (col: ColumnDescription) => void
): React.ReactNode => {
  if (['text', 'textarea'].includes(column.type)) {
    return <TableTextEditor column={column} onUpdate={update} />;
  }

  if (['select', 'radio'].includes(column.type)) {
    return <TableDropdownEditor column={column} onUpdate={update} />;
  }

  if (column.type === 'checkbox') {
    return <TableCheckboxEditor column={column} onUpdate={update} />;
  }

  return null;
};
