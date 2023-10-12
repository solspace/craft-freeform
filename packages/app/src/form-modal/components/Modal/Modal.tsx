import React, { useEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import { SuccessBehavior, useFormState } from '@ff-app/form-modal/hooks/use-form-state';
import { useFormStatusOptions } from '@ff-app/form-modal/hooks/use-form-status-options';
import { useFormTemplatesOptions } from '@ff-app/form-modal/hooks/use-form-templates-options';
import { useFormTypeOptions } from '@ff-app/form-modal/hooks/use-form-type-options';
import { useSuccessTemplatesOptions } from '@ff-app/form-modal/hooks/use-success-templates-options';
import Checkbox from '@ff-app/shared/Forms/Checkbox/Checkbox';
import ColorPicker from '@ff-app/shared/Forms/ColorPicker/ColorPicker';
import Select from '@ff-app/shared/Forms/Select/Select';
import Text from '@ff-app/shared/Forms/Text/Text';
import translate from '@ff-app/utils/translations';

import { Button, Content, Footer, Grid, Header, Overlay, Wrapper } from './Modal.styles';
import camelCase from 'lodash.camelcase';

type Props = {
  closeHandler?: () => void;
};

export const Modal: React.FC<Props> = ({ closeHandler }) => {
  const typeOptions = useFormTypeOptions();
  const [defaultStatusId, statusOptions] = useFormStatusOptions();
  const [defaultTemplate, templateOptions] = useFormTemplatesOptions();
  const successTemplateOptions = useSuccessTemplatesOptions();
  const [isShown, setIsShown] = useState(false);
  const { form, errors, update, saveHandler, isSaving } = useFormState(defaultStatusId, defaultTemplate);

  const formNameRef = useRef<HTMLInputElement>();

  useEffect(() => {
    formNameRef.current.focus();
  }, []);

  useEffect(() => {
    setIsShown(true);

    const handler = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsShown(false);
      }
    };

    document.addEventListener('keyup', handler);

    return (): void => {
      document.removeEventListener('keyup', handler);
    };
  }, []);

  return (
    <CSSTransition in={isShown} timeout={300} onExited={closeHandler}>
      {(): React.ReactNode => (
        <Overlay>
          <Wrapper onClick={(event): void => event.stopPropagation()}>
            <Header>{translate('Create a New Form')}</Header>
            <Content>
              <Grid columns={2}>
                <Text
                  ref={formNameRef}
                  name="name"
                  label="Name"
                  required
                  value={form.settings.general.name}
                  onChange={(value): void =>
                    update({
                      ...form,
                      settings: {
                        ...form.settings,
                        general: {
                          ...form.settings.general,
                          name: value,
                          handle: camelCase(value as string),
                        },
                      },
                    })
                  }
                  errors={errors.name}
                />
                <Text
                  name="handle"
                  label="Handle"
                  required
                  value={form.settings.general.handle}
                  errors={errors.handle}
                  onChange={(value): void =>
                    update({
                      ...form,
                      settings: {
                        ...form.settings,
                        general: {
                          ...form.settings.general,
                          handle: value.replace(/[^a-zA-Z0-9\-_]/g, ''),
                        },
                      },
                    })
                  }
                />
              </Grid>

              {typeOptions.length > 1 && (
                <Grid columns={2}>
                  <Select
                    name="type"
                    label="Type"
                    required
                    options={typeOptions}
                    value={form.type}
                    errors={errors.type}
                    onChange={(value): void =>
                      update({
                        ...form,
                        type: value,
                      })
                    }
                  />
                  <ColorPicker
                    name="color"
                    label="Color"
                    value={form.settings.general.color}
                    onChange={(value): void =>
                      update({
                        ...form,
                        settings: {
                          ...form.settings,
                          general: {
                            ...form.settings.general,
                            color: value,
                          },
                        },
                      })
                    }
                  />
                </Grid>
              )}

              <Grid columns={2}>
                <Select
                  name="formTemplate"
                  label="Formatting Template"
                  options={templateOptions}
                  value={form.settings.general.formattingTemplate}
                  errors={errors.formTemplate}
                  onChange={(value): void =>
                    update({
                      ...form,
                      settings: {
                        ...form.settings,
                        general: {
                          ...form.settings.general,
                          formattingTemplate: value,
                        },
                      },
                    })
                  }
                />
                <Select
                  name="status"
                  label="Default Status"
                  options={statusOptions}
                  value={form.settings.general.defaultStatus}
                  errors={errors.status}
                  onChange={(value): void =>
                    update({
                      ...form,
                      settings: {
                        ...form.settings,
                        general: {
                          ...form.settings.general,
                          defaultStatus: Number(value),
                        },
                      },
                    })
                  }
                />
              </Grid>

              <Grid columns={2}>
                <Checkbox
                  name="ajax"
                  label="Enable AJAX"
                  checked={form.settings.behavior.ajax}
                  onClick={(value): void =>
                    update({
                      ...form,
                      settings: {
                        ...form.settings,
                        behavior: {
                          ...form.settings.behavior,
                          ajax: value,
                        },
                      },
                    })
                  }
                />
                <Checkbox
                  name="storeData"
                  label="Store Submitted Data"
                  checked={form.settings.general.storeData}
                  onClick={(value): void =>
                    update({
                      ...form,
                      settings: {
                        ...form.settings,
                        general: {
                          ...form.settings.general,
                          storeData: value,
                        },
                      },
                    })
                  }
                />
              </Grid>

              <Grid columns={2}>
                <Select
                  name="successBehavior"
                  label="Success Behavior"
                  value={form.settings.behavior.successBehavior}
                  onChange={(value): void =>
                    update({
                      ...form,
                      settings: {
                        ...form.settings,
                        behavior: {
                          ...form.settings.behavior,
                          successBehavior: value as SuccessBehavior,
                        },
                      },
                    })
                  }
                  options={[
                    { label: 'Reload Form with Success Message', value: SuccessBehavior.Reload },
                    { label: 'Load Success Template', value: SuccessBehavior.Template },
                    { label: 'Use Return URL', value: SuccessBehavior.ReturnURL },
                  ]}
                />

                {![SuccessBehavior.Template, SuccessBehavior.Reload].includes(
                  form.settings.behavior.successBehavior
                ) && (
                  <Text
                    name="returnUrl"
                    label="Return URL"
                    value={form.settings.behavior.returnUrl}
                    onChange={(value): void =>
                      update({
                        ...form,
                        settings: {
                          ...form.settings,
                          behavior: {
                            ...form.settings.behavior,
                            returnUrl: value,
                          },
                        },
                      })
                    }
                  />
                )}

                {form.settings.behavior.successBehavior === SuccessBehavior.Template && (
                  <Select
                    name="successTemplate"
                    label="Success Template"
                    value={form.settings.behavior.successTemplate}
                    onChange={(value): void =>
                      update({
                        ...form,
                        settings: {
                          ...form.settings,
                          behavior: {
                            ...form.settings.behavior,
                            successTemplate: value,
                          },
                        },
                      })
                    }
                    options={successTemplateOptions}
                  />
                )}
              </Grid>
            </Content>
            <Footer>
              <Button className={`submit btn ${isSaving ? 'disabled' : ''}`} onClick={saveHandler} disabled={isSaving}>
                {translate('Continue')}
              </Button>
              <Button
                className={`btn ${isSaving ? 'disabled' : ''}`}
                onClick={(): void => setIsShown(false)}
                disabled={isSaving}
              >
                {translate('Cancel')}
              </Button>
            </Footer>
          </Wrapper>
        </Overlay>
      )}
    </CSSTransition>
  );
};
