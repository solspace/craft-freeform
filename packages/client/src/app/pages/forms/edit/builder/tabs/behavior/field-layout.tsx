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
import type { EditableProperty, Form } from '@ff-client/types/forms';

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

  const successAndErrorsGroupFields = editableProperties.filter(
    ({ tab, group }) => tab === 'behavior' && group === 'success-and-errors'
  );

  const processingGroupFields = editableProperties.filter(
    ({ tab, group }) => tab === 'behavior' && group === 'processing'
  );

  const limitsGroupFields = editableProperties.filter(
    ({ tab, group }) => tab === 'behavior' && group === 'limits'
  );

  const field: React.FC = (form: Form, editableProperty: EditableProperty) => {
    if (editableProperty.type === 'string') {
      return (
        <Text
          id={editableProperty.handle}
          label={editableProperty.label}
          value={(form.properties[editableProperty.handle] as string) || ''}
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
      );
    }

    if (editableProperty.type === 'select') {
      return (
        <SelectBox
          id={editableProperty.handle}
          label={editableProperty.label}
          value={(form.properties[editableProperty.handle] as string) || ''}
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
      );
    }

    if (editableProperty.type === 'textarea') {
      return (
        <Textarea
          rows={4}
          id={editableProperty.handle}
          label={editableProperty.label}
          value={(form.properties[editableProperty.handle] as string) || ''}
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
      );
    }

    if (editableProperty.type === 'bool') {
      return (
        <LightSwitch
          id={editableProperty.handle}
          label={editableProperty.label}
          value={Boolean(
            (form.properties[editableProperty.handle] as number) || false
          )}
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
      );
    }

    if (editableProperty.type === 'datetime') {
      return (
        <DateTime
          id={editableProperty.handle}
          label={editableProperty.label}
          value={(form.properties[editableProperty.handle] as string) || ''}
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
      );
    }
  };

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
                <Grid>
                  {successAndErrorsGroupFields
                    .sort((a, b) => a.order - b.order)
                    .map((editableProperty) => (
                      <GridItem key={editableProperty.handle}>
                        {field(form, editableProperty)}
                      </GridItem>
                    ))}
                </Grid>
              </Column>
            </Row>
            <Row>
              <Column>
                <Heading>Processing</Heading>
              </Column>
            </Row>
            <Row>
              <Column>
                <Grid>
                  {processingGroupFields
                    .sort((a, b) => a.order - b.order)
                    .map((editableProperty) => (
                      <GridItem key={editableProperty.handle}>
                        {field(form, editableProperty)}
                      </GridItem>
                    ))}
                </Grid>
              </Column>
            </Row>
            <Row>
              <Column>
                <Heading>Limits</Heading>
              </Column>
            </Row>
            <Row>
              <Column>
                <Grid>
                  {limitsGroupFields
                    .sort((a, b) => a.order - b.order)
                    .map((editableProperty) => (
                      <GridItem key={editableProperty.handle}>
                        {field(form, editableProperty)}
                      </GridItem>
                    ))}
                </Grid>
              </Column>
            </Row>
          </Column>
        </Row>
      </Column>
    </Wrapper>
  );
};
