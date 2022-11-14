import React from 'react';
import { useSelector } from 'react-redux';
import {
  Color,
  FormTagAttribute,
  LightSwitch,
  SelectBox,
  Text,
  Textarea,
} from '@components/form-controls/controls';
import { useAppDispatch } from '@editor/store';
import { modifyProperty, selectForm, update } from '@editor/store/slices/form';
import type { Attribute } from '@ff-client/types/forms';

import { Column, Grid, GridItem, Wrapper } from './field-layout.styles';

export const FieldLayout: React.FC = () => {
  const dispatch = useAppDispatch();

  const form = useSelector(selectForm);

  return (
    <Wrapper>
      <Column>
        <Grid>
          <GridItem>
            <Text
              id="name"
              label="Form Name"
              value={(form.properties.name as string) || ''}
              placeholder=""
              instructions="Name or title of the form."
              onChange={(value: string) =>
                dispatch(
                  modifyProperty({
                    value,
                    key: 'name',
                  })
                )
              }
            />
          </GridItem>
          <GridItem>
            <Text
              id="handle"
              label="Form Handle"
              value={(form.properties.handle as string) || ''}
              placeholder=""
              instructions="How you’ll refer to this form in the templates."
              onChange={(value: string) =>
                dispatch(
                  modifyProperty({
                    value,
                    key: 'handle',
                  })
                )
              }
            />
          </GridItem>
          <GridItem>
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
              instructions="Select the type of form this is. When additional form types are installed, you can choose a different form type that enables special behaviors."
              onChange={(type: string) =>
                dispatch(
                  update({
                    type,
                  })
                )
              }
            />
          </GridItem>
          <GridItem>
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
              instructions="The default status to be assigned to new submissions."
              onChange={(value: number) =>
                dispatch(
                  modifyProperty({
                    key: 'defaultStatus',
                    value: Number(value),
                  })
                )
              }
            />
          </GridItem>
          <GridItem>
            <Text
              id="submissionTitleFormat"
              label="Submission Title"
              value={(form.properties.submissionTitleFormat as string) || ''}
              placeholder=""
              instructions="What the auto-generated submission titles should look like."
              onChange={(value: string) =>
                dispatch(
                  modifyProperty({
                    value,
                    key: 'submissionTitleFormat',
                  })
                )
              }
            />
          </GridItem>
          <GridItem />
          <GridItem>
            <Text
              id="formTemplate"
              label="Formatting Template"
              value={(form.properties.formTemplate as string) || ''}
              placeholder=""
              instructions="The formatting template to assign to this form when using Render method."
              onChange={(value: string) =>
                dispatch(
                  modifyProperty({
                    value,
                    key: 'formTemplate',
                  })
                )
              }
            />
          </GridItem>
          <GridItem />
          <GridItem>
            <Textarea
              rows={4}
              id="description"
              label="Form Description / Notes"
              value={(form.properties.description as string) || ''}
              placeholder=""
              instructions="Description or notes for this form."
              onChange={(value: string) =>
                dispatch(
                  modifyProperty({
                    value,
                    key: 'description',
                  })
                )
              }
            />
          </GridItem>
          <GridItem>
            <Color
              id="color"
              label="Form Color"
              value={(form.properties.color as string) || '#ff0000'}
              instructions="The color to be used for the dashboard and charts inside the control panel."
              onChange={(value: string) =>
                dispatch(
                  modifyProperty({
                    value,
                    key: 'color',
                  })
                )
              }
            />
          </GridItem>
          <GridItem>
            <LightSwitch
              id="storeData"
              label="Store Submitted Data"
              value={(form.properties.storeData as boolean) || false}
              instructions="Should the submission data for this form be stored in the database?"
              onChange={(value: boolean) =>
                dispatch(
                  modifyProperty({
                    key: 'storeData',
                    value: Boolean(value),
                  })
                )
              }
            />
          </GridItem>
          <GridItem>
            <LightSwitch
              id="recaptchaEnabled"
              label="Enable Captchas"
              value={(form.properties.recaptchaEnabled as boolean) || false}
              instructions="Disabling this option removes the Captcha check for this specific form."
              onChange={(value: boolean) =>
                dispatch(
                  modifyProperty({
                    key: 'recaptchaEnabled',
                    value: Boolean(value),
                  })
                )
              }
            />
          </GridItem>
          <GridItem>
            <SelectBox
              id="optInDataStorageTargetHash"
              label="Opt-In Data Storage Checkbox"
              value={
                (form.properties.optInDataStorageTargetHash as string) || ''
              }
              options={[
                {
                  label: 'Enabled',
                  value: 'enabled',
                },
                {
                  label: 'Disabled',
                  value: 'disabled',
                },
              ]}
              instructions="Allow users to decide whether the submission data is saved to your site or not."
              onChange={(value: string) =>
                dispatch(
                  modifyProperty({
                    value,
                    key: 'optInDataStorageTargetHash',
                  })
                )
              }
            />
          </GridItem>
          <GridItem />
          <GridItem>
            <FormTagAttribute
              id="attributeBag"
              label="Form Tag Attributes"
              value={(form.properties.attributeBag as Attribute[]) || []}
              instructions="Add any tag attributes to the HTML element."
              onChange={(value: Attribute[]) =>
                dispatch(
                  modifyProperty({
                    value,
                    key: 'attributeBag',
                  })
                )
              }
            />
          </GridItem>
        </Grid>
      </Column>
    </Wrapper>
  );
};
