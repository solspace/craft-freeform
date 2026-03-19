import { Dropdown } from "@components/elements/custom-dropdown/dropdown";
import { Icon } from "@components/elements/custom-dropdown/dropdown.styles";
import { LightSwitch } from "@components/elements/lightswitch/lightswitch";
import type { UpdateValue } from "@components/form-controls";
import { Control } from "@components/form-controls/control";
import {
  ColumnEditor,
  ColumnTabsWrapper,
  TableContainer,
  TableEditorWrapper,
} from "@components/form-controls/control-types/table/table.editor.styles";
import type {
  ColumnDescription,
  TableColumnMetadata,
} from "@components/form-controls/control-types/table/table.types";
import IconCross from "@components/form-controls/icons/cross";
import MoveIcon from "@components/form-controls/icons/move";
import { FlexRow } from "@components/layout/blocks/flex";
import type { Field } from "@editor/store/slices/layout/fields";
import { useTranslations } from "@editor/store/slices/translations/translations.hooks";
import type {
  Option as PropertyOption,
  TableProperty,
} from "@ff-client/types/properties";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import type React from "react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Sortable from "sortablejs";

import IconCheckbox from "./editor/icon.checkbox";
import IconDropdown from "./editor/icon.dropdown";
import IconFile from "./editor/icon.file";
import IconPlus from "./editor/icon.plus";
import IconRadio from "./editor/icon.radios";
import IconText from "./editor/icon.text";
import IconTextarea from "./editor/icon.textarea";
import {
  AddColumnButton,
  RemoveColumnButton,
  ReorderColumnButton,
  TableColumnTabLabel,
  TableColumnTabs,
} from "./editor/table.editor.styles";
import { TableCheckboxEditor } from "./editor/table.input.checkbox";
import { TableDropdownEditor } from "./editor/table.input.dropdown";
import { TableFileEditor } from "./editor/table.input.file";
import { TableTextEditor } from "./editor/table.input.text";
import { deleteColumn, moveColumn, updateColumn } from "./table.operations";

type Props = {
  columnTypes: PropertyOption[];
  columns: ColumnDescription[];
  updateValue: UpdateValue<ColumnDescription[]>;
  property: TableProperty;
  context: Field;
};

type ColumnType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "file";

const FILE_COLUMN_DEFAULT_METADATA: TableColumnMetadata = {
  fileCount: 1,
  maxFileSizeKB: 2048,
  fileKinds: ["image"],
  assetSourceId: null,
  uploadLocation: null,
};

const getColumnForType = (
  column: ColumnDescription,
  type: string,
): ColumnDescription => {
  if (type === "file") {
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

const typeIcons: Record<ColumnType, ReactNode> = {
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
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const shouldScrollContentRef = useRef(false);
  const columnKeyMapRef = useRef(new WeakMap<ColumnDescription, string>());
  const columnKeyCounterRef = useRef(0);

  const isTranslating = willTranslate(property.handle);
  const translation = getTranslation<ColumnDescription[]>(
    property.handle,
    columns,
  );

  const columnValues = isTranslating ? translation : columns;
  const column = useMemo<ColumnDescription>(() => {
    return columnValues[tabIndex];
  }, [tabIndex, columnValues]);

  const getColumnKey = (column: ColumnDescription): string => {
    const existingKey = columnKeyMapRef.current.get(column);
    if (existingKey) {
      return existingKey;
    }

    const key = `table-column-${columnKeyCounterRef.current++}`;
    columnKeyMapRef.current.set(column, key);

    return key;
  };

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want to trigger this when the tab index changes, not when the column values change
  useEffect(() => {
    labelInputRef.current?.focus();
  }, [tabIndex, columnValues.length]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We only want to trigger this when the tab index changes, not when the column values change
  useEffect(() => {
    tabRefs.current[tabIndex]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });

    if (shouldScrollContentRef.current) {
      shouldScrollContentRef.current = false;
      labelInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [tabIndex, columnValues.length]);

  useEffect(() => {
    if (!tabsRef.current || columnValues.length < 2) {
      return;
    }

    const sortable = Sortable.create(tabsRef.current, {
      animation: 150,
      draggable: ".table-column-tab",
      handle: ".column-drag-handle",
      onEnd: (event) => {
        const fromIndex = event.oldIndex;
        const toIndex = event.newIndex;

        if (
          fromIndex === undefined ||
          toIndex === undefined ||
          fromIndex === toIndex
        ) {
          return;
        }

        updateValue(moveColumn(fromIndex, toIndex, columnValues));

        setTabIndex((activeIndex) => {
          if (activeIndex === fromIndex) {
            return toIndex;
          }

          if (fromIndex < activeIndex && activeIndex <= toIndex) {
            return activeIndex - 1;
          }

          if (toIndex <= activeIndex && activeIndex < fromIndex) {
            return activeIndex + 1;
          }

          return activeIndex;
        });
      },
    });

    return () => {
      sortable.destroy();
    };
  }, [columnValues, updateValue]);

  const addTab = (): void => {
    const newIndex = columnValues.length;
    updateValue([
      ...columnValues,
      { label: "New column", type: "text", value: "" },
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
          <TableColumnTabs ref={tabsRef}>
            {columnValues.length > 0 &&
              columnValues.map((column, index) => (
                <a
                  key={getColumnKey(column)}
                  className={classes(
                    "table-column-tab",
                    column.required && "required",
                    index === tabIndex && "active",
                  )}
                  ref={(element) => {
                    tabRefs.current[index] = element;
                  }}
                  onClick={() => setTabIndex(index)}
                >
                  <Icon>{typeIcons[column.type as ColumnType]}</Icon>

                  <TableColumnTabLabel>
                    {translate(column.label)}
                  </TableColumnTabLabel>

                  {columnValues.length > 1 && (
                    <ReorderColumnButton
                      type="button"
                      className="column-drag-handle"
                      title={translate("Reorder column")}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                    >
                      <MoveIcon />
                    </ReorderColumnButton>
                  )}

                  {index === tabIndex && columnValues.length > 1 && (
                    <RemoveColumnButton
                      type="button"
                      title={translate("Remove column")}
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
            title={translate("Add column")}
            onClick={addTab}
          >
            <IconPlus />
          </AddColumnButton>
        </ColumnTabsWrapper>

        <ColumnEditor>
          <FlexRow>
            <Control width={60} label={translate("Label")} handle="label">
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
                      columnValues,
                    ),
                  )
                }
              />
            </Control>

            <Control width={30} label={translate("Column Type")} handle="type">
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
                      columnValues,
                    ),
                  );
                }}
              />
            </Control>

            <Control
              width={10}
              label={translate("Required")}
              handle="required"
              justify="center"
            >
              <LightSwitch
                enabled={!!column?.required}
                onClick={(value) => {
                  updateValue(
                    updateColumn(
                      tabIndex,
                      { ...column, required: value },
                      columnValues,
                    ),
                  );
                }}
              />
            </Control>
          </FlexRow>
          {renderCellEditor(
            column,
            (col: ColumnDescription) =>
              updateValue(updateColumn(tabIndex, col, columnValues)),
            property,
          )}
        </ColumnEditor>
      </TableContainer>
    </TableEditorWrapper>
  );
};

const renderCellEditor = (
  column: ColumnDescription,
  update: (col: ColumnDescription) => void,
  property: TableProperty,
): ReactNode => {
  if (!column) {
    return null;
  }

  if (["text", "textarea"].includes(column.type)) {
    return <TableTextEditor column={column} onUpdate={update} />;
  }

  if (["select", "radio"].includes(column.type)) {
    return <TableDropdownEditor column={column} onUpdate={update} />;
  }

  if (column.type === "checkbox") {
    return <TableCheckboxEditor column={column} onUpdate={update} />;
  }

  if (column.type === "file") {
    return (
      <TableFileEditor column={column} onUpdate={update} property={property} />
    );
  }

  return null;
};
