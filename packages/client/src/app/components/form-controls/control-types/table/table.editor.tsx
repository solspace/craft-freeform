import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { Icon } from '@components/elements/custom-dropdown/dropdown.styles';
import type { UpdateValue } from '@components/form-controls';
import { Control } from '@components/form-controls/control';
import {
  ColumnEditor,
  ColumnTabsWrapper,
  TableContainer,
  TableEditorWrapper,
} from '@components/form-controls/control-types/table/table.editor.styles';
import type {
  ColumnDescription,
  TableColumnMetadata,
} from '@components/form-controls/control-types/table/table.types';
import IconCross from '@components/form-controls/icons/cross.svg';
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
import IconFile from './editor/icon.file.svg';
import IconPlus from './editor/icon.plus.svg';
import IconRadio from './editor/icon.radios.svg';
import IconText from './editor/icon.text.svg';
import IconTextarea from './editor/icon.textarea.svg';
import {
  AddColumnButton,
  RemoveColumnButton,
  TableColumnTabs,
} from './editor/table.editor.styles';
import { TableCheckboxEditor } from './editor/table.input.checkbox';
import { TableDropdownEditor } from './editor/table.input.dropdown';
import { TableFileEditor } from './editor/table.input.file';
import { TableTextEditor } from './editor/table.input.text';
import { deleteColumn, updateColumn } from './table.operations';

type Props = {
  columnTypes: PropertyOption[];
  columns: ColumnDescription[];
  updateValue: UpdateValue<ColumnDescription[]>;
  property: TableProperty;
  context: Field;
};

type ColumnType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'file';

const FILE_COLUMN_DEFAULT_METADATA: TableColumnMetadata = {
  fileCount: 1,
  maxFileSizeKB: 2048,
  fileKinds: ['image'],
  assetSourceId: null,
  uploadLocation: null,
};

const getColumnForType = (
  column: ColumnDescription,
  type: string
): ColumnDescription => {
  if (type === 'file') {
    return {
      ...column,
      type,
      metadata: {
        ...FILE_COLUMN_DEFAULT_METADATA,
        ...(column.metadata || {}),
      },
    };
  }

  return {
    ...column,
    type,
    metadata: {},
  };
};

const typeIcons: Record<ColumnType, JSX.Element> = {
  text: <IconText />,
  textarea: <IconTextarea />,
  select: <IconDropdown />,
  radio: <IconRadio />,
  checkbox: <IconCheckbox />,
  file: <IconFile />,
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
  const labelInputRef = useRef<HTMLInputElement>(null);
  const tabRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const shouldScrollContentRef = useRef(false);

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

  useEffect(() => {
    labelInputRef.current?.focus();
  }, [tabIndex, columnValues.length]);

  useEffect(() => {
    tabRefs.current[tabIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
    });

    if (shouldScrollContentRef.current) {
      shouldScrollContentRef.current = false;
      labelInputRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [tabIndex, columnValues.length]);

  const addTab = (): void => {
    const newIndex = columnValues.length;
    updateValue([
      ...columnValues,
      { label: 'New column', type: 'text', value: '' },
    ]);
    shouldScrollContentRef.current = true;
    setTabIndex(newIndex);
  };

  const removeTab = (index: number): void => {
    if (columnValues.length <= 1) {
      return;
    }

    const nextColumns = deleteColumn(index, columnValues);
    let nextTabIndex = tabIndex;

    if (tabIndex > index) {
      nextTabIndex = tabIndex - 1;
    } else if (tabIndex === index) {
      nextTabIndex = Math.max(0, index - 1);
    }

    updateValue(nextColumns);
    setTabIndex(nextTabIndex);
  };

  return (
    <TableEditorWrapper>
      <TableContainer>
        <ColumnTabsWrapper>
          <TableColumnTabs>
            {columnValues.length > 0 &&
              columnValues.map((column, index) => (
                <a
                  key={index}
                  className={classes(index === tabIndex && 'active')}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  onClick={() => setTabIndex(index)}
                >
                  <Icon>{typeIcons[column.type as ColumnType]}</Icon>

                  {translate(columnValues[index].label)}

                  {index === tabIndex && columnValues.length > 1 && (
                    <RemoveColumnButton
                      type="button"
                      title={translate('Remove column')}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        removeTab(index);
                      }}
                    >
                      <IconCross />
                    </RemoveColumnButton>
                  )}
                </a>
              ))}
          </TableColumnTabs>

          <AddColumnButton
            type="button"
            className="btn"
            title={translate('Add column')}
            onClick={addTab}
          >
            <IconPlus />
          </AddColumnButton>
        </ColumnTabsWrapper>

        <ColumnEditor>
          <FlexRow>
            <Control width={70} label={translate('Label')} handle="label">
              <input
                type="text"
                className="text fullwidth"
                ref={labelInputRef}
                value={column?.label}
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
                value={column?.type}
                options={typeOptions}
                onChange={(value) => {
                  updateValue(
                    updateColumn(
                      tabIndex,
                      getColumnForType(column, value),
                      columnValues
                    )
                  );
                }}
              />
            </Control>
          </FlexRow>
          {renderCellEditor(
            column,
            (col: ColumnDescription) =>
              updateValue(updateColumn(tabIndex, col, columnValues)),
            property
          )}
        </ColumnEditor>
      </TableContainer>
    </TableEditorWrapper>
  );
};

const renderCellEditor = (
  column: ColumnDescription,
  update: (col: ColumnDescription) => void,
  property: TableProperty
): React.ReactNode => {
  if (!column) {
    return null;
  }

  if (['text', 'textarea'].includes(column.type)) {
    return <TableTextEditor column={column} onUpdate={update} />;
  }

  if (['select', 'radio'].includes(column.type)) {
    return <TableDropdownEditor column={column} onUpdate={update} />;
  }

  if (column.type === 'checkbox') {
    return <TableCheckboxEditor column={column} onUpdate={update} />;
  }

  if (column.type === 'file') {
    return (
      <TableFileEditor column={column} onUpdate={update} property={property} />
    );
  }

  return null;
};
