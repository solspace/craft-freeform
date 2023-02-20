import React, { useEffect, useState } from 'react';
import { HelpText } from '@components/elements/help-text';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import type { UpdateValue } from '../../field/editable-component';
import { useCellNavigation } from '../hooks/use-cell-navigation';
import {
  Button,
  Cell,
  DeleteIcon,
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
import type { AttributeCollection, AttributeTarget } from './attributes.types';

type Props = {
  attributes: AttributeCollection;
  updateValue: UpdateValue<AttributeCollection>;
};

export const AttributesEditor: React.FC<Props> = ({
  attributes,
  updateValue,
}) => {
  const entries = Object.entries(attributes);
  const [firstTab] = entries.at(0);

  const [tab, setTab] = useState<string>(firstTab);

  const [currentTab, currentAttributes] = entries.find(([key]) => key === tab);

  const { activeCell, setActiveCell, setCellRef } = useCellNavigation(
    currentAttributes.length,
    2
  );

  // Focus first cell when switching tabs
  useEffect(() => {
    setActiveCell(0, 0);
  }, [currentTab]);

  const appendAndFocus = (rowIndex: number, cellIndex: number): void => {
    setActiveCell(rowIndex, cellIndex);
    updateValue(addAttribute(currentTab as AttributeTarget, attributes));
  };

  useOnKeypress(
    {
      callback: (event: KeyboardEvent): void => {
        if (event.key === 'Enter') {
          appendAndFocus(currentAttributes.length, 0);
        }
      },
    },
    [currentAttributes]
  );

  return (
    <AttributeEditorWrapper>
      <AttributeTypeTabs>
        {entries.map(([key]) => (
          <a
            key={key}
            className={classes(key === tab && 'active')}
            onClick={() => setTab(key)}
          >
            {key[0].toUpperCase()}
            {key.substring(1, key.length)}
          </a>
        ))}
      </AttributeTypeTabs>
      <AttributeTabContent>
        <InputPreview name={currentTab} attributes={currentAttributes} />
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
                      onChange={(event) => {
                        updateValue(
                          updateAttribute(
                            index,
                            currentTab as AttributeTarget,
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
                      onChange={(event) => {
                        updateValue(
                          updateAttribute(
                            index,
                            currentTab as AttributeTarget,
                            [tag, event.target.value],
                            attributes
                          )
                        );
                      }}
                    />
                  </Cell>

                  <Cell tiny>
                    <Button
                      onClick={() => {
                        updateValue(
                          deleteAttribute(
                            index,
                            currentTab as AttributeTarget,
                            attributes
                          )
                        );
                        setActiveCell(Math.max(index - 1, 0), 0);
                      }}
                    >
                      <DeleteIcon />
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

  return <div>Editorrrishe {JSON.stringify(attributes)}</div>;
};
