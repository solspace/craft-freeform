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
  Column,
  Grid,
  GridItem,
  Heading,
  Row,
  Wrapper,
} from './field-layout.styles';

export const FieldLayout: React.FC = () => {
  const dispatch = useAppDispatch();

  const form = useSelector(selectForm);

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
                  <GridItem>
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
                  </GridItem>
                  <GridItem>
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
                  </GridItem>
                  <GridItem>
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
                  </GridItem>
                  <GridItem>
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
                  </GridItem>
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
                  <GridItem>
                    <LightSwitch
                      id="ajaxEnabled"
                      label="Use AJAX"
                      value={(form.properties.ajaxEnabled as boolean) || false}
                      instructions="Use Freeform's built-in automatic AJAX submit feature."
                      onChange={(value: boolean) =>
                        dispatch(
                          modifyProperty({
                            key: 'ajaxEnabled',
                            value: Boolean(value),
                          })
                        )
                      }
                    />
                  </GridItem>
                  <GridItem />
                  <GridItem>
                    <LightSwitch
                      id="showSpinner"
                      label="Show Processing Indicator on Submit"
                      value={(form.properties.showSpinner as boolean) || false}
                      instructions="Show a loading indicator on the submit button upon submission of the form."
                      onChange={(value: boolean) =>
                        dispatch(
                          modifyProperty({
                            key: 'showSpinner',
                            value: Boolean(value),
                          })
                        )
                      }
                    />
                  </GridItem>
                  <GridItem />
                  <GridItem>
                    <LightSwitch
                      id="showLoadingText"
                      label="Show Processing Text"
                      value={
                        (form.properties.showLoadingText as boolean) || false
                      }
                      instructions="Enabling this will change the submit button's label to the text of your choice."
                      onChange={(value: boolean) =>
                        dispatch(
                          modifyProperty({
                            value: Boolean(value),
                            key: 'showLoadingText',
                          })
                        )
                      }
                    />
                  </GridItem>
                  <GridItem>
                    {form.properties.showLoadingText && (
                      <Text
                        id="loadingText"
                        label="Processing Text"
                        value={
                          (form.properties.loadingText as string) ||
                          'Processing...'
                        }
                        placeholder=""
                        instructions=""
                        onChange={(value: string) =>
                          dispatch(
                            modifyProperty({
                              value,
                              key: 'loadingText',
                            })
                          )
                        }
                      />
                    )}
                  </GridItem>
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
                  <GridItem>
                    <SelectBox
                      id="limitFormSubmissions"
                      label="Limit Form Submission Rate"
                      value={
                        (form.properties.limitFormSubmissions as string) ||
                        'no_limit'
                      }
                      options={[
                        {
                          label: 'Do not limit',
                          value: 'no_limit',
                        },
                        {
                          label: 'Logged in Users only (no limit)',
                          value: 'no_limit_logged_in_users_only',
                        },
                        {
                          label: 'Once per Cookie only',
                          value: 'cookie',
                        },
                        {
                          label: 'Once per IP/Cookie combo',
                          value: 'ip_cookie',
                        },
                        {
                          label: 'Once per logged in Users only',
                          value: 'once_per_logged_in_users_only',
                        },
                        {
                          label: 'Once per logged in User or Guest Cookie only',
                          value: 'once_per_logged_in_user_or_guest_cookie_only',
                        },
                        {
                          label:
                            'Once per logged in User or Guest IP/Cookie combo',
                          value:
                            'once_per_logged_in_user_or_guest_ip_cookie_combo',
                        },
                      ]}
                      instructions="Limit the number of times a user can submit the form."
                      onChange={(value: string) =>
                        dispatch(
                          modifyProperty({
                            value,
                            key: 'limitFormSubmissions',
                          })
                        )
                      }
                    />
                  </GridItem>
                  <GridItem>
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
                  </GridItem>
                </Grid>
              </Column>
            </Row>
          </Column>
        </Row>
      </Column>
    </Wrapper>
  );
};
