import React, { useRef } from 'react';
import { HelpText } from '@components/elements/help-text';
import Bool from '@components/form-controls/control-types/bool/bool';
import {
  Button,
  Cell,
  Input,
  TableContainer,
  TabularOptions,
} from '@components/form-controls/control-types/table/table.editor.styles';
import { DraggableRow } from '@components/form-controls/draggable-row';
import { useCellNavigation } from '@components/form-controls/hooks/use-cell-navigation';
import CrossIcon from '@components/form-controls/icons/cross.svg';
import MoveIcon from '@components/form-controls/icons/move.svg';
import { PreviewEditor } from '@components/form-controls/preview/previewable-component.styles';
import { PropertyType } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import type {
  ConfigurationProps,
  CustomOptionsConfiguration,
} from '../../options.types';

import {
  addOption,
  deleteOption,
  moveOption,
  toggleUseCustomValues,
  updateOption,
} from './custom.operations';

export const CustomEditor: React.FC<
  ConfigurationProps<CustomOptionsConfiguration>
> = ({ value, updateValue, defaultValue, updateDefaultValue, isMultiple }) => {
  const { options = [], useCustomValues = false } = value;

  const refs = useRef([]);
  refs.current = options.map(
    (option, index) =>
      refs.current[index] || React.createRef<HTMLButtonElement>()
  );

  const { activeCell, setActiveCell, setCellRef, keyPressHandler } =
    useCellNavigation(options.length, useCustomValues ? 2 : 1);

  const addCell = (cellIndex: number, atIndex?: number): void => {
    setActiveCell(
      atIndex !== undefined ? atIndex + 1 : options.length,
      cellIndex
    );
    updateValue(
      addOption(value, atIndex === undefined ? options.length : atIndex + 1)
    );
  };

  return (
    <PreviewEditor>
      <Bool
        property={{
          label: translate('Use custom values'),
          handle: 'useCustomValues',
          type: PropertyType.Boolean,
        }}
        value={useCustomValues}
        updateValue={() =>
          updateValue(toggleUseCustomValues(value, !useCustomValues))
        }
      />
      {!!options.length && (
        <TableContainer>
          <TabularOptions>
            <tbody>
              {options.map((option, index) => (
                <DraggableRow
                  key={index}
                  index={index}
                  dragRef={refs.current[index]}
                  onDrop={(fromIndex, toIndex) =>
                    updateValue(moveOption(value, fromIndex, toIndex))
                  }
                >
                  <Cell>
                    <Input
                      type="text"
                      value={option.label}
                      placeholder={translate('Label')}
                      autoFocus={activeCell === `${index}:0`}
                      ref={(element) => setCellRef(element, index, 0)}
                      onFocus={() => setActiveCell(index, 0)}
                      onKeyDown={keyPressHandler({
                        onEnter: ({ shiftKey }) => {
                          addCell(0, shiftKey ? index : undefined);
                        },
                      })}
                      onChange={(event) =>
                        updateValue(
                          updateOption(
                            index,
                            {
                              ...option,
                              label: event.target.value,
                              value: event.target.value,
                            },
                            value
                          )
                        )
                      }
                    />
                  </Cell>

                  {useCustomValues && (
                    <Cell>
                      <Input
                        type="text"
                        className="code"
                        value={option.value}
                        placeholder={translate('Value')}
                        autoFocus={activeCell === `${index}:1`}
                        ref={(element) => setCellRef(element, index, 1)}
                        onFocus={() => setActiveCell(index, 1)}
                        onKeyDown={keyPressHandler({
                          onEnter: ({ shiftKey }) => {
                            addCell(1, shiftKey ? index : undefined);
                          },
                        })}
                        onChange={(event) =>
                          updateValue(
                            updateOption(
                              index,
                              {
                                ...option,
                                value: event.target.value,
                              },
                              value
                            )
                          )
                        }
                      />
                    </Cell>
                  )}

                  {options.length > 1 && (
                    <>
                      <Cell $tiny>
                        <Bool
                          property={{
                            label: '',
                            handle: `${index}-check`,
                            type: PropertyType.Boolean,
                          }}
                          value={
                            isMultiple
                              ? defaultValue.includes(option.value)
                              : option.value === defaultValue
                          }
                          updateValue={() => {
                            if (isMultiple) {
                              const val = defaultValue as string[];

                              updateDefaultValue(
                                val.includes(option.value)
                                  ? val.filter(
                                      (value) => value !== option.value
                                    )
                                  : [...val, option.value]
                              );
                            } else {
                              updateDefaultValue(
                                option.value === defaultValue
                                  ? ''
                                  : option.value
                              );
                            }
                          }}
                        />
                      </Cell>
                      <Cell $tiny>
                        <Button ref={refs.current[index]} className="handle">
                          <MoveIcon />
                        </Button>
                      </Cell>
                      <Cell $tiny>
                        <Button
                          onClick={() => {
                            updateValue(deleteOption(index, value));
                            setActiveCell(Math.max(index - 1, 0), 0);
                          }}
                        >
                          <CrossIcon />
                        </Button>
                      </Cell>
                    </>
                  )}
                </DraggableRow>
              ))}
            </tbody>
          </TabularOptions>
        </TableContainer>
      )}

      <HelpText>
        <span
          dangerouslySetInnerHTML={{
            __html: translate(
              'Press <b>enter</b> while editing a cell to add a new row.'
            ),
          }}
        />
      </HelpText>
    </PreviewEditor>
  );
};
