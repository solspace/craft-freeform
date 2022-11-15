import React from 'react';
import { useSelector } from 'react-redux';
import {
  DateTime,
  LightSwitch,
  SelectBox,
  Text,
  Textarea,
} from '@components/form-controls/controls';
import { useAppDispatch } from '@editor/store';
import { modifyProperty, selectForm } from '@editor/store/slices/form';
import { useQueryEditableProperties } from '@ff-client/queries/forms';

import {
  Column,
  Grid,
  GridItem,
  Heading,
  Row,
  Wrapper,
} from './field-layout.styles';

export const FieldLayout: React.FC = () => {
  const { data: editableProperties, isFetching } = useQueryEditableProperties();

  const dispatch = useAppDispatch();

  const form = useSelector(selectForm);

  if (!editableProperties && isFetching) {
    return (
      <Wrapper>
        <Column>
          <Heading>Fetching...</Heading>
        </Column>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <Column>
        <Row>
          <Column>
            <Row>
              <Column>
                <Heading>Success &amp; Errors</Heading>
              </Column>
            </Row>
            <Row>
              <Column>
                <Heading>Processing</Heading>
              </Column>
            </Row>
            <Row>
              <Column>
                <Heading>Limits</Heading>
              </Column>
            </Row>
            {/*
            <Row>
              <Column>
                <Grid>
                  {editableProperties
                    .filter(({ tab }) => tab === 'behavior')
                    .sort((a, b) => a.order - b.order)
                    .map((editableProperty) => (
                      <GridItem key={editableProperty.handle}>
                        {editableProperty.type === 'string' && (
                          <Text
                            id={editableProperty.handle}
                            label={editableProperty.label}
                            value={editableProperty.value as string}
                            placeholder={editableProperty.placeholder}
                            instructions={editableProperty.instructions}
                            onChange={(value: string) =>
                              dispatch(
                                modifyProperty({
                                  value,
                                  key: editableProperty.handle,
                                })
                              )
                            }
                          />
                        )}
                        {editableProperty.type === 'select' && (
                          <SelectBox
                            id={editableProperty.handle}
                            label={editableProperty.label}
                            value={editableProperty.value as string}
                            options={editableProperty.options}
                            instructions={editableProperty.instructions}
                            onChange={(value: string) =>
                              dispatch(
                                modifyProperty({
                                  value,
                                  key: editableProperty.handle,
                                })
                              )
                            }
                          />
                        )}
                        {editableProperty.type === 'textarea' && (
                          <Textarea
                            rows={4}
                            id={editableProperty.handle}
                            label={editableProperty.label}
                            value={editableProperty.value as string}
                            placeholder={editableProperty.placeholder}
                            instructions={editableProperty.instructions}
                            onChange={(value: string) =>
                              dispatch(
                                modifyProperty({
                                  value,
                                  key: editableProperty.handle,
                                })
                              )
                            }
                          />
                        )}
                        {editableProperty.type === 'bool' && (
                          <LightSwitch
                            id={editableProperty.handle}
                            label={editableProperty.label}
                            value={Boolean(editableProperty.value as number)}
                            instructions={editableProperty.instructions}
                            onChange={(value: boolean) =>
                              dispatch(
                                modifyProperty({
                                  key: editableProperty.handle,
                                  value: Boolean(value),
                                })
                              )
                            }
                          />
                        )}
                        {editableProperty.type === 'datetime' && (
                          <DateTime
                            id={editableProperty.handle}
                            label={editableProperty.label}
                            value={editableProperty.value as string}
                            instructions={editableProperty.instructions}
                            onChange={(value: string) =>
                              dispatch(
                                modifyProperty({
                                  value,
                                  key: editableProperty.handle,
                                })
                              )
                            }
                          />
                        )}
                      </GridItem>
                    ))}
                </Grid>
              </Column>
            </Row>
            */}
          </Column>
        </Row>
      </Column>
    </Wrapper>
  );
};
