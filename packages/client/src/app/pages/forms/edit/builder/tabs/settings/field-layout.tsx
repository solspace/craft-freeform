import React from 'react';
import { useSelector } from 'react-redux';
import {
  Color,
  FormTagAttribute,
  LightSwitch,
  SelectBox,
  Text,
  Textarea,
} from '@ff-client/app/components/form-controls/controls';
import {
  modifyProperty,
  selectForm,
  update,
} from '@ff-client/app/pages/forms/edit/store/slices/form';
import { useAppDispatch } from '@ff-client/app/pages/forms/edit/store/store';
import type { FormTagAttributeProps } from '@ff-client/types/properties';

import { FieldLayoutGrid, FieldLayoutWrapper } from './field-layout.styles';

export const FieldLayout: React.FC = () => {
  const dispatch = useAppDispatch();

  const form = useSelector(selectForm);

  return (
    <FieldLayoutWrapper>
      <FieldLayoutGrid>
        <div style={{ padding: '20px' }}>
          <Text
            id="name"
            label="Form Name"
            value={(form.properties.name as string) || ''}
            placeholder=""
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: string) =>
              dispatch(
                modifyProperty({
                  value,
                  key: 'name',
                })
              )
            }
          />
        </div>
        <div style={{ padding: '20px' }}>
          <Text
            id="handle"
            label="Form Handle"
            value={(form.properties.handle as string) || ''}
            placeholder=""
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: string) =>
              dispatch(
                modifyProperty({
                  value,
                  key: 'handle',
                })
              )
            }
          />
        </div>
        <div style={{ padding: '20px' }}>
          <SelectBox
            id="type"
            label="Form Type"
            value={(form.type as string) || ''}
            options={[
              {
                label: 'Regular',
                value: 'Solspace\\Freeform\\Form\\Types\\Regular',
              },
            ]}
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(type: string) =>
              dispatch(
                update({
                  type,
                })
              )
            }
          />
        </div>
        <div style={{ padding: '20px' }}>
          <SelectBox
            id="defaultStatus"
            label="Default State"
            value={(form.properties.defaultStatus as number) || 3}
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
              dispatch(
                modifyProperty({
                  key: 'defaultStatus',
                  value: Number(value),
                })
              )
            }
          />
        </div>
        <div style={{ padding: '20px' }}>
          <Text
            id="submissionTitleFormat"
            label="Submission Title"
            value={(form.properties.submissionTitleFormat as string) || ''}
            placeholder=""
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: string) =>
              dispatch(
                modifyProperty({
                  value,
                  key: 'submissionTitleFormat',
                })
              )
            }
          />
        </div>
        <div />
        <div style={{ padding: '20px' }}>
          <Text
            id="formattingTemplate"
            label="Formatting Template"
            value={(form.properties.formattingTemplate as string) || ''}
            placeholder=""
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: string) =>
              dispatch(
                modifyProperty({
                  value,
                  key: 'formattingTemplate',
                })
              )
            }
          />
        </div>
        <div />
        <div style={{ padding: '20px' }}>
          <Textarea
            rows={4}
            id="description"
            label="Form Description / Notes"
            value={(form.properties.description as string) || ''}
            placeholder=""
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: string) =>
              dispatch(
                modifyProperty({
                  value,
                  key: 'description',
                })
              )
            }
          />
        </div>
        <div style={{ padding: '20px' }}>
          <Color
            id="color"
            label="Form Color"
            value={(form.properties.color as string) || '#ff0000'}
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: string) =>
              dispatch(
                modifyProperty({
                  value,
                  key: 'color',
                })
              )
            }
          />
        </div>
        <div style={{ padding: '20px' }}>
          <LightSwitch
            id="storeSubmittedData"
            label="Store Submitted Data"
            value={(form.properties.storeSubmittedData as boolean) || false}
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: boolean) =>
              dispatch(
                modifyProperty({
                  key: 'storeSubmittedData',
                  value: Boolean(value),
                })
              )
            }
          />
        </div>
        <div style={{ padding: '20px' }}>
          <LightSwitch
            id="enableCaptchas"
            label="Enable Captchas"
            value={(form.properties.enableCaptchas as boolean) || false}
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: boolean) =>
              dispatch(
                modifyProperty({
                  key: 'enableCaptchas',
                  value: Boolean(value),
                })
              )
            }
          />
        </div>
        <div style={{ padding: '20px' }}>
          <SelectBox
            id="optInDataStorageTargetHash"
            label="Opt-In Data Storage Checkbox"
            value={(form.properties.optInDataStorageTargetHash as number) || 0}
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
              dispatch(
                modifyProperty({
                  key: 'optInDataStorageTargetHash',
                  value: Number(value),
                })
              )
            }
          />
        </div>
        <div />
        <div style={{ padding: '20px' }}>
          <FormTagAttribute
            id="formTagAttributes"
            label="Form Tag Attributes"
            value={
              (form.properties.formTagAttributes as FormTagAttributeProps[]) ||
              []
            }
            instructions="Lorem ipsum dolor sit amet, consectetur adipiscing elit"
            onChange={(value: FormTagAttributeProps[]) =>
              dispatch(
                modifyProperty({
                  value,
                  key: 'formTagAttributes',
                })
              )
            }
          />
        </div>
      </FieldLayoutGrid>
    </FieldLayoutWrapper>
  );
};
