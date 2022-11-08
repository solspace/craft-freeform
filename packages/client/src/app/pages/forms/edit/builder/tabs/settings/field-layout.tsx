import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Color,
  Control,
  FormTagAttribute,
  LightSwitch,
  SelectBox,
  Text,
  Textarea,
} from '@ff-client/app/components/form-controls/controls';
import {
  modifyProperty,
  selectForm,
  selectFormProperties,
  selectFormType,
  update,
} from '@ff-client/app/pages/forms/edit/store/slices/form';
import { useAppDispatch } from '@ff-client/app/pages/forms/edit/store/store';
import type { FormTagAttributeProps } from '@ff-client/types/forms';
import type {
  ModifyPropertyFormTagAttributeHandlerProps,
  ModifyPropertyHandlerProps,
} from '@ff-client/types/properties';

import { FieldLayoutGrid, FieldLayoutWrapper } from './field-layout.styles';

export const FieldLayout: React.FC = () => {
  const dispatch = useAppDispatch();

  const form = useSelector(selectForm);
  const type = useSelector(selectFormType);
  const properties = useSelector(selectFormProperties);

  const onModifyPropertyHandler = (
    payload: ModifyPropertyHandlerProps
  ): void => {
    dispatch(modifyProperty(payload));
  };

  const deleteFormTagAttributeHandler = (payload: number): void => {
    let formTagAttributes = JSON.parse(
      JSON.stringify(properties.formTagAttributes)
    );

    // Filter out attribute based on its index
    formTagAttributes = formTagAttributes.filter(
      (formTagAttribute: FormTagAttributeProps, index: number) =>
        index !== payload
    );

    dispatch(
      modifyProperty({
        key: 'formTagAttributes',
        value: formTagAttributes,
      })
    );
  };

  const updateFormTagAttributeHandler = (
    payload: ModifyPropertyFormTagAttributeHandlerProps
  ): void => {
    const formTagAttributes = JSON.parse(
      JSON.stringify(properties.formTagAttributes)
    );

    // Find and update attribute property value
    formTagAttributes.forEach(
      (formTagAttribute: FormTagAttributeProps, index: number) => {
        if (index === payload.index) {
          if (payload.key === 'key') {
            formTagAttribute['key'] = String(payload.value);
          } else {
            formTagAttribute['value'] = payload.value ?? '';
          }
        }
      }
    );

    dispatch(
      modifyProperty({
        key: 'formTagAttributes',
        value: formTagAttributes,
      })
    );
  };

  const addFormTagAttribute = (): void => {
    dispatch(
      modifyProperty({
        key: 'formTagAttributes',
        value: [
          ...properties.formTagAttributes,
          {
            key: '',
            value: '',
          },
        ],
      })
    );
  };

  useEffect(() => {
    console.log('Settings >> FieldLayout >> form', form);
  }, [form]);

  return (
    <FieldLayoutWrapper>
      <FieldLayoutGrid>
        <div style={{ padding: '20px' }}>
          <Text
            id="name"
            label="Form Name"
            value={(properties.name as string) || ''}
            placeholder=""
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: string) =>
              onModifyPropertyHandler({
                key: 'name',
                value: value,
              })
            }
          />
        </div>
        <div style={{ padding: '20px' }}>
          <Text
            id="handle"
            label="Form Handle"
            value={(properties.handle as string) || ''}
            placeholder=""
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: string) =>
              onModifyPropertyHandler({
                key: 'handle',
                value: value,
              })
            }
          />
        </div>
        <div style={{ padding: '20px' }}>
          <SelectBox
            id="type"
            label="Form Type"
            value={(type as string) || ''}
            options={[
              {
                label: 'Regular',
                value: 'Solspace\\Freeform\\Form\\Types\\Regular',
              },
            ]}
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: string) =>
              dispatch(
                update({
                  type: value,
                })
              )
            }
          />
        </div>
        <div style={{ padding: '20px' }}>
          <SelectBox
            id="defaultStatus"
            label="Default State"
            value={(properties.defaultStatus as number) || 3}
            options={[
              {
                label: 'Pending',
                value: 1,
              },
              {
                label: 'Open',
                value: 2,
              },
              {
                label: 'Closed',
                value: 3,
              },
            ]}
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: number) =>
              onModifyPropertyHandler({
                key: 'defaultStatus',
                value: Number(value),
              })
            }
          />
        </div>
        <div style={{ padding: '20px' }}>
          <Text
            id="submissionTitleFormat"
            label="Submission Title"
            value={(properties.submissionTitleFormat as string) || ''}
            placeholder=""
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: string) =>
              onModifyPropertyHandler({
                key: 'submissionTitleFormat',
                value: value,
              })
            }
          />
        </div>
        <div />
        <div style={{ padding: '20px' }}>
          <Text
            id="formattingTemplate"
            label="Formatting Template"
            value={(properties.formattingTemplate as string) || ''}
            placeholder=""
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: string) =>
              onModifyPropertyHandler({
                key: 'formattingTemplate',
                value: value,
              })
            }
          />
        </div>
        <div />
        <div style={{ padding: '20px' }}>
          <Textarea
            rows={4}
            id="description"
            label="Form Description / Notes"
            value={(properties.description as string) || ''}
            placeholder=""
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: string) =>
              onModifyPropertyHandler({
                key: 'description',
                value: value,
              })
            }
          />
        </div>
        <div style={{ padding: '20px' }}>
          <Color
            id="color"
            label="Form Color"
            value={(properties.color as string) || '#f7ed6c'}
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: string) =>
              onModifyPropertyHandler({
                key: 'color',
                value: value,
              })
            }
          />
        </div>
        <div style={{ padding: '20px' }}>
          <LightSwitch
            id="storeSubmittedData"
            label="Store Submitted Data"
            value={(properties.storeSubmittedData as boolean) || false}
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: boolean) =>
              onModifyPropertyHandler({
                key: 'storeSubmittedData',
                value: Boolean(value),
              })
            }
          />
        </div>
        <div style={{ padding: '20px' }}>
          <LightSwitch
            id="enableCaptchas"
            label="Enable Captchas"
            value={(properties.enableCaptchas as boolean) || false}
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: boolean) =>
              onModifyPropertyHandler({
                key: 'enableCaptchas',
                value: Boolean(value),
              })
            }
          />
        </div>
        <div style={{ padding: '20px' }}>
          <SelectBox
            id="optInDataStorageTargetHash"
            label="Opt-In Data Storage Checkbox"
            value={(properties.optInDataStorageTargetHash as number) || 0}
            options={[
              {
                label: 'Enabled',
                value: 1,
              },
              {
                label: 'Disabled',
                value: 0,
              },
            ]}
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: number) =>
              onModifyPropertyHandler({
                key: 'optInDataStorageTargetHash',
                value: Number(value),
              })
            }
          />
        </div>
        <div />
        <div style={{ padding: '20px' }}>
          <Control
            id="formTagAttributes"
            label="Form Tag Attributes"
            instructions=""
          >
            {properties.formTagAttributes.map(
              ({ key, value }: FormTagAttributeProps, index: number) => {
                return (
                  <FormTagAttribute
                    key={index}
                    index={index}
                    attributeKey={key}
                    attributeValue={value}
                    onDeleteField={deleteFormTagAttributeHandler}
                    onChangeField={updateFormTagAttributeHandler}
                  />
                );
              }
            )}
            <button
              type="button"
              className="btn"
              style={{ marginTop: '20px' }}
              onClick={addFormTagAttribute}
            >
              Add&nbsp;+
            </button>
          </Control>
        </div>
      </FieldLayoutGrid>
    </FieldLayoutWrapper>
  );
};
