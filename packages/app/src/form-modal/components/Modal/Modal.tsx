import Checkbox from '@ff-app/shared/Forms/Checkbox/Checkbox';
import Select from '@ff-app/shared/Forms/Select/Select';
import Text from '@ff-app/shared/Forms/Text/Text';
import React, { useEffect, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import { Button, Content, Footer, Grid, Header, Overlay, Wrapper } from './Modal.styles';
import translate from '@ff-app/utils/translations';
import ColorPicker from '@ff-app/shared/Forms/ColorPicker/ColorPicker';
import { useFormTypeOptions } from '@ff-app/form-modal/hooks/use-form-type-options';
import { SuccessBehavior, useFormState } from '@ff-app/form-modal/hooks/use-form-state';
import { useFormStatusOptions } from '@ff-app/form-modal/hooks/use-form-status-options';
import { useFormTemplatesOptions } from '@ff-app/form-modal/hooks/use-form-templates-options';

type Props = {
  closeHandler?: () => void;
};

export const Modal: React.FC<Props> = ({ closeHandler }) => {
  const typeOptions = useFormTypeOptions();
  const [defaultStatusId, statusOptions] = useFormStatusOptions();
  const [defaultTemplate, templateOptions] = useFormTemplatesOptions();
  const [isShown, setIsShown] = useState(false);
  const { form, errors, update, saveHandler, isSaving } = useFormState(defaultStatusId, defaultTemplate);

  useEffect(() => {
    setIsShown(true);
  }, []);

  return (
    <CSSTransition in={isShown} timeout={300} onExited={closeHandler}>
      {(): React.ReactNode => (
        <Overlay>
          <Wrapper onClick={(event): void => event.stopPropagation()}>
            <Header>{translate('Create a New Form')}</Header>
            <Content>
              <Grid columns={2}>
                <Text name="name" label="Name" required value={form.name} onChange={update} errors={errors.name} />
                <Text
                  name="handle"
                  label="Handle"
                  required
                  value={form.handle}
                  errors={errors.handle}
                  onChange={update}
                />
              </Grid>

              <Grid columns={2}>
                <Select
                  name="type"
                  label="Type"
                  required
                  options={typeOptions}
                  value={form.type}
                  errors={errors.type}
                  onChange={update}
                />
                <ColorPicker name="color" label="Color" value={form.color} onChange={update} />
              </Grid>

              <Text
                name="submissionTitle"
                label="Submission Title"
                required
                value={form.submissionTitle}
                errors={errors.submissionTitle}
                onChange={update}
              />

              <Grid columns={2}>
                <Select
                  name="formTemplate"
                  label="Formatting Template"
                  options={templateOptions}
                  value={form.formTemplate}
                  errors={errors.formTemplate}
                  onChange={update}
                />
                <Select
                  name="status"
                  label="Default Status"
                  options={statusOptions}
                  value={form.status}
                  errors={errors.status}
                  onChange={update}
                />
              </Grid>

              <Grid columns={2}>
                <Checkbox name="ajax" label="Enable AJAX" checked={form.ajax} onClick={update} />
                <Checkbox name="storeData" label="Store Submitted Data" checked={form.storeData} onClick={update} />
              </Grid>

              <Grid columns={2}>
                <Select
                  name="successBehavior"
                  label="Success Behavior"
                  value={form.successBehavior}
                  onChange={update}
                  options={[
                    { label: 'Return URL', value: SuccessBehavior.ReturnURL },
                    { label: 'Template', value: SuccessBehavior.Template },
                    { label: 'Nothing', value: SuccessBehavior.Nothing },
                  ]}
                />

                <Text name="returnUrl" label="Return URL" value={form.returnUrl} onChange={update} />
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
