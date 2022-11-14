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

import {
  FieldLayoutColumn,
  FieldLayoutGrid,
  FieldLayoutGridItem,
  FieldLayoutHeading,
  FieldLayoutRow,
  FieldLayoutWrapper,
} from './field-layout.styles';

export const FieldLayout: React.FC = () => {
  const dispatch = useAppDispatch();

  const form = useSelector(selectForm);

  return (
    <FieldLayoutWrapper>
      <FieldLayoutColumn>
        <FieldLayoutRow>
          <FieldLayoutColumn>
            <FieldLayoutRow>
              <FieldLayoutColumn>
                <FieldLayoutHeading>Success &amp; Errors</FieldLayoutHeading>
              </FieldLayoutColumn>
            </FieldLayoutRow>
            <FieldLayoutRow>
              <FieldLayoutColumn>
                <FieldLayoutGrid>
                  <FieldLayoutGridItem>
                    <SelectBox
                      id="successBehavior"
                      label="Success Behavior"
                      value={
                        (form.properties.successBehavior as string) ||
                        'reload-form-with-success-message'
                      }
                      options={[
                        {
                          label: 'Reload Form with Success Message',
                          value: 'reload-form-with-success-message',
                        },
                        {
                          label: 'Use Return URL',
                          value: 'use-return-url',
                        },
                        {
                          label: 'Load Success Template',
                          value: 'load-success-template',
                        },
                      ]}
                      instructions="Set how you'd like the success return of this form to be handled. May also be overridden at the template level."
                      onChange={(value: string) =>
                        dispatch(
                          modifyProperty({
                            value,
                            key: 'successBehavior',
                          })
                        )
                      }
                    />
                  </FieldLayoutGridItem>
                  <FieldLayoutGridItem>
                    {form.properties.successBehavior === 'use-return-url' && (
                      <Text
                        id="returnUrl"
                        label="Return URL"
                        value={(form.properties.returnUrl as string) || ''}
                        placeholder=""
                        instructions=""
                        onChange={(value: string) =>
                          dispatch(
                            modifyProperty({
                              value,
                              key: 'returnUrl',
                            })
                          )
                        }
                      />
                    )}
                    {form.properties.successBehavior ===
                      'load-success-template' && (
                      <SelectBox
                        id="successTemplate"
                        label="Success Template"
                        value={
                          (form.properties.successTemplate as string) || ''
                        }
                        options={[
                          {
                            label: 'My Success Template Name',
                            value: 'my-success-template-name',
                          },
                        ]}
                        instructions=""
                        onChange={(value: string) =>
                          dispatch(
                            modifyProperty({
                              value,
                              key: 'successTemplate',
                            })
                          )
                        }
                      />
                    )}
                  </FieldLayoutGridItem>
                  <FieldLayoutGridItem>
                    <Textarea
                      rows={4}
                      id="successMessage"
                      label="Success Message"
                      value={(form.properties.successMessage as string) || ''}
                      placeholder="Form has been submitted successfully!"
                      instructions="The text to be shown at the top of the form if the submit is successful (AJAX), or load in your template with form.successMessage."
                      onChange={(value: string) =>
                        dispatch(
                          modifyProperty({
                            value,
                            key: 'successMessage',
                          })
                        )
                      }
                    />
                  </FieldLayoutGridItem>
                  <FieldLayoutGridItem>
                    <Textarea
                      rows={4}
                      id="errorMessage"
                      label="Error Message"
                      value={(form.properties.errorMessage as string) || ''}
                      placeholder="Sorry, there was an error submitting the form. Please try again."
                      instructions="The text to be shown at the top of the form if there are any errors upon submit (AJAX), or load in your template with form.errorMessage."
                      onChange={(value: string) =>
                        dispatch(
                          modifyProperty({
                            value,
                            key: 'errorMessage',
                          })
                        )
                      }
                    />
                  </FieldLayoutGridItem>
                </FieldLayoutGrid>
              </FieldLayoutColumn>
            </FieldLayoutRow>
            <FieldLayoutRow>
              <FieldLayoutColumn>
                <FieldLayoutHeading>Processing</FieldLayoutHeading>
              </FieldLayoutColumn>
            </FieldLayoutRow>
            <FieldLayoutRow>
              <FieldLayoutColumn>
                <FieldLayoutGrid>
                  <FieldLayoutGridItem>
                    <LightSwitch
                      id="useAjax"
                      label="Use AJAX"
                      value={(form.properties.useAjax as boolean) || false}
                      instructions="Use Freeform's built-in automatic AJAX submit feature."
                      onChange={(value: boolean) =>
                        dispatch(
                          modifyProperty({
                            key: 'useAjax',
                            value: Boolean(value),
                          })
                        )
                      }
                    />
                  </FieldLayoutGridItem>
                  <FieldLayoutGridItem />
                  <FieldLayoutGridItem>
                    <LightSwitch
                      id="showProcessingIndicatorOnSubmit"
                      label="Show Processing Indicator on Submit"
                      value={
                        (form.properties
                          .showProcessingIndicatorOnSubmit as boolean) || false
                      }
                      instructions="Show a loading indicator on the submit button upon submission of the form."
                      onChange={(value: boolean) =>
                        dispatch(
                          modifyProperty({
                            value: Boolean(value),
                            key: 'showProcessingIndicatorOnSubmit',
                          })
                        )
                      }
                    />
                  </FieldLayoutGridItem>
                  <FieldLayoutGridItem />
                  <FieldLayoutGridItem>
                    <LightSwitch
                      id="showProcessingText"
                      label="Show Processing Text"
                      value={
                        (form.properties.showProcessingText as boolean) || false
                      }
                      instructions="Enabling this will change the submit button's label to the text of your choice."
                      onChange={(value: boolean) =>
                        dispatch(
                          modifyProperty({
                            value: Boolean(value),
                            key: 'showProcessingText',
                          })
                        )
                      }
                    />
                  </FieldLayoutGridItem>
                  <FieldLayoutGridItem>
                    {form.properties.showProcessingText && (
                      <Text
                        id="processingText"
                        label="Processing Text"
                        value={
                          (form.properties.processingText as string) ||
                          'Processing...'
                        }
                        placeholder=""
                        instructions=""
                        onChange={(value: string) =>
                          dispatch(
                            modifyProperty({
                              value,
                              key: 'processingText',
                            })
                          )
                        }
                      />
                    )}
                  </FieldLayoutGridItem>
                </FieldLayoutGrid>
              </FieldLayoutColumn>
            </FieldLayoutRow>
            <FieldLayoutRow>
              <FieldLayoutColumn>
                <FieldLayoutHeading>Limits</FieldLayoutHeading>
              </FieldLayoutColumn>
            </FieldLayoutRow>
            <FieldLayoutRow>
              <FieldLayoutColumn>
                <FieldLayoutGrid>
                  <FieldLayoutGridItem>
                    <SelectBox
                      id="limitFormSubmissionRate"
                      label="Limit Form Submission Rate"
                      value={
                        (form.properties.limitFormSubmissionRate as string) ||
                        'do-not-limit'
                      }
                      options={[
                        {
                          label: 'Do not limit',
                          value: 'do-not-limit',
                        },
                        {
                          label: 'Logged in Users only (no limit)',
                          value: 'logged-in-users-only-no-limit',
                        },
                        {
                          label: 'Once per Cookie only',
                          value: 'once-per-cookie-only',
                        },
                        {
                          label: 'Once per IP/Cookie combo',
                          value: 'once-per-ip-cookie-combo',
                        },
                        {
                          label: 'Once per logged in Users only',
                          value: 'once-per-logged-in-users-only',
                        },
                        {
                          label: 'Once per logged in User or Guest Cookie only',
                          value: 'once-per-logged-in-user-or-guest-cookie-only',
                        },
                        {
                          label:
                            'Once per logged in User or Guest IP/Cookie combo',
                          value:
                            'once-per-logged-in-user-or-guest-ip-cookie-combo',
                        },
                      ]}
                      instructions="Limit the number of times a user can submit the form."
                      onChange={(value: string) =>
                        dispatch(
                          modifyProperty({
                            value,
                            key: 'limitFormSubmissionRate',
                          })
                        )
                      }
                    />
                  </FieldLayoutGridItem>
                  <FieldLayoutGridItem>
                    <DateTime
                      id="stopSubmissionsAfter"
                      label="Stop Submissions After"
                      value={
                        (form.properties.stopSubmissionsAfter as string) || ''
                      }
                      instructions="Set a date after which the form will no longer accept submissions."
                      onChange={(value: string) =>
                        dispatch(
                          modifyProperty({
                            value,
                            key: 'stopSubmissionsAfter',
                          })
                        )
                      }
                    />
                  </FieldLayoutGridItem>
                </FieldLayoutGrid>
              </FieldLayoutColumn>
            </FieldLayoutRow>
          </FieldLayoutColumn>
        </FieldLayoutRow>
      </FieldLayoutColumn>
    </FieldLayoutWrapper>
  );
};
