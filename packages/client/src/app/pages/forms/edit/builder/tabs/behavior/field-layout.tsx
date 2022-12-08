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
import { modifySettings, selectForm } from '@editor/store/slices/form';
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

// TODO: refactor this whole file to come from attribute descriptors instead
const namespace = 'behavior';

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
    const { type, handle, label, placeholder, instructions } = editableProperty;
    const key = handle;
    const value = form.settings?.[namespace]?.[handle];

    if (type === 'string') {
      return (
        <Text
          id={handle}
          label={label}
          value={value || ''}
          placeholder={placeholder}
          instructions={instructions}
          onChange={(value: string) =>
            dispatch(modifySettings({ namespace, value, key }))
          }
        />
      );
    }

    if (type === 'select') {
      return (
        <SelectBox
          id={handle}
          label={label}
          value={value || ''}
          options={editableProperty.options}
          instructions={instructions}
          onChange={(value: string) =>
            dispatch(modifySettings({ namespace, value, key }))
          }
        />
      );
    }

    if (type === 'textarea') {
      return (
        <Textarea
          rows={4}
          id={handle}
          label={label}
          value={value || ''}
          placeholder={placeholder}
          instructions={instructions}
          onChange={(value: string) =>
            dispatch(modifySettings({ namespace, value, key }))
          }
        />
      );
    }

    if (type === 'bool') {
      return (
        <LightSwitch
          id={handle}
          label={label}
          value={value}
          instructions={instructions}
          onChange={(value: boolean) =>
            dispatch(modifySettings({ namespace, value, key }))
          }
        />
      );
    }

    if (type === 'datetime') {
      return (
        <DateTime
          id={handle}
          label={label}
          value={value || ''}
          instructions={instructions}
          onChange={(value: string) =>
            dispatch(modifySettings({ namespace, value, key }))
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
