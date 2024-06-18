import React, { useEffect, useState } from 'react';
import { HelpText } from '@components/elements/help-text';
import type { UpdateValue } from '@components/form-controls';
import CrossIcon from '@components/form-controls/icons/cross.svg';
import type {
  AttributeProperty,
  AttributeTab,
} from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import { useCellNavigation } from '../../hooks/use-cell-navigation';
import {
  Button,
  Cell,
  Input,
  Row,
  TabularOptions,
} from '../table/table.editor.styles';

import {
  AttributeContainer,
  AttributeEditorWrapper,
  AttributeTabContent,
  AttributeTypeTabs,
} from './attributes.editor.styles';
import { InputPreview } from './attributes.input-preview';
import {
  addAttribute,
  deleteAttribute,
  updateAttribute,
} from './attributes.operations';
import type { EditableAttributeCollection } from './attributes.types';

type Props = {
  property: AttributeProperty;
  attributes: EditableAttributeCollection;
  updateValue: UpdateValue<EditableAttributeCollection>;
};

export const AttributesEditor: React.FC<Props> = ({
  property,
  attributes,
  updateValue,
}) => {
  const tabs = property.tabs || [];
  const [tab, setTab] = useState<AttributeTab>(tabs.at(0));

  const entries = Object.entries(attributes);
  const [currentTab, currentAttributes] = entries.find(
    ([key]) => key === tab.handle
  ) || [tab.handle, []];

  const { activeCell, setActiveCell, setCellRef, keyPressHandler } =
    useCellNavigation(currentAttributes.length, 2);

  // Focus first cell when switching tabs
  useEffect(() => {
    setActiveCell(0, 0);
  }, [currentTab]);

  if (!currentTab || !currentAttributes) {
    return null;
  }

  const appendAndFocus = (
    rowIndex: number,
    cellIndex: number,
    atIndex?: number
  ): void => {
    setActiveCell(atIndex !== undefined ? atIndex + 1 : rowIndex, cellIndex);
    updateValue(
      addAttribute(
        currentTab,
        attributes,
        atIndex !== undefined ? atIndex : currentAttributes.length - 1
      )
    );
  };

  return (
    <AttributeEditorWrapper>
      <AttributeTypeTabs>
        {property.tabs &&
          property.tabs.map((tabEntry) => (
            <a
              key={tabEntry.handle}
              className={classes(tabEntry === tab && 'active')}
              onClick={() => setTab(tabEntry)}
            >
              {translate(tabEntry.label)}
            </a>
          ))}
      </AttributeTypeTabs>
      <AttributeTabContent>
        <InputPreview tab={tab} attributes={currentAttributes} />
        <AttributeContainer>
          <TabularOptions>
            <tbody>
              {!currentAttributes.length && (
                <Row>
                  <Cell>
                    <Input
                      type="text"
                      placeholder={translate('Attribute')}
                      onFocus={() => {
                        appendAndFocus(0, 0);
                      }}
                    />
                  </Cell>
                  <Cell>
                    <Input
                      type="text"
                      placeholder={translate('Value')}
                      onFocus={() => {
                        appendAndFocus(0, 1);
                      }}
                    />
                  </Cell>
                </Row>
              )}

              {currentAttributes.map(([tag, value], index) => (
                <Row key={index}>
                  <Cell>
                    <Input
                      type="text"
                      value={String(tag)}
                      placeholder={translate('Attribute')}
                      autoFocus={activeCell === `${index}:0`}
                      ref={(element) => setCellRef(element, index, 0)}
                      onFocus={() => setActiveCell(index, 0)}
                      onKeyDown={keyPressHandler({
                        onEnter: (event) => {
                          appendAndFocus(
                            event.shiftKey ? index : currentAttributes.length,
                            0,
                            event.shiftKey ? index : undefined
                          );
                        },
                      })}
                      onChange={(event) => {
                        updateValue(
                          updateAttribute(
                            index,
                            currentTab,
                            [event.target.value, value],
                            attributes
                          )
                        );
                      }}
                    />
                  </Cell>
                  <Cell>
                    <Input
                      type="text"
                      value={String(value)}
                      placeholder={translate('Value')}
                      autoFocus={activeCell === `${index}:1`}
                      ref={(element) => setCellRef(element, index, 1)}
                      onFocus={() => setActiveCell(index, 1)}
                      onKeyDown={keyPressHandler({
                        onEnter: (event) => {
                          appendAndFocus(
                            event.shiftKey ? index : currentAttributes.length,
                            1,
                            event.shiftKey ? index : undefined
                          );
                        },
                      })}
                      onChange={(event) => {
                        updateValue(
                          updateAttribute(
                            index,
                            currentTab,
                            [tag, event.target.value],
                            attributes
                          )
                        );
                      }}
                    />
                  </Cell>

                  <Cell $tiny>
                    <Button
                      tabIndex={-1}
                      onClick={() => {
                        updateValue(
                          deleteAttribute(index, currentTab, attributes)
                        );
                        setActiveCell(Math.max(index - 1, 0), 0);
                      }}
                    >
                      <CrossIcon />
                    </Button>
                  </Cell>
                </Row>
              ))}
            </tbody>
          </TabularOptions>
        </AttributeContainer>
        <br />
        <HelpText>
          <span
            dangerouslySetInnerHTML={{
              __html: translate(
                'Press <b>enter</b> while editing a cell to add a new row.'
              ),
            }}
          />
        </HelpText>
      </AttributeTabContent>
    </AttributeEditorWrapper>
  );
};
