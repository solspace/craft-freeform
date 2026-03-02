import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormComponent } from '@components/form-controls';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import {
  ModalContainer,
  ModalFooter,
  ModalHeader,
} from '@components/modals/modal.styles';
import type { ModalContainerProps } from '@components/modals/modal.types';
import { ErrorBlock } from '@components/notification-blocks/error/error-block';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import type { Form } from '@ff-client/types/forms';
import type {
  SelectProperty,
  StringProperty,
  TextareaProperty,
} from '@ff-client/types/properties';
import { PropertyType } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';
import axios from 'axios';

import { useAiIntegrations } from './modal.form.create-with-ai.queries';
import { FormWrapper } from './modal.form.styles';

export const CreateWithAiFormModal: React.FC<ModalContainerProps> = ({
  closeModal,
}) => {
  const navigate = useNavigate();
  const [integrationUid, setIntegrationUid] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: aiIntegrations = [], isLoading: isLoadingIntegrations } =
    useAiIntegrations();

  useEffect(() => {
    if (aiIntegrations.length > 0 && !integrationUid) {
      setIntegrationUid(aiIntegrations[0].uid);
    }
  }, [aiIntegrations]);

  const integrationOptions = useMemo(
    () => aiIntegrations.map((int) => ({ value: int.uid, label: int.name })),
    [aiIntegrations]
  );

  const integrationProperty = useMemo<SelectProperty>(
    () => ({
      type: PropertyType.Select,
      handle: 'integrationUid',
      label: translate('AI Integration'),
      instructions: translate(
        'Choose which AI integration to use. Model and API key are already configured in the integration.'
      ),
      required: true,
      options: integrationOptions,
      emptyOption: translate('Select an AI integration…'),
    }),
    [integrationOptions]
  );

  const promptProperty = useMemo<TextareaProperty>(
    () => ({
      type: PropertyType.Textarea,
      handle: 'prompt',
      label: translate('Describe your form'),
      instructions: translate('Describe the fields and purpose of the form.'),
      required: true,
      rows: 4,
      placeholder: translate(
        'e.g. Contact form with name, email, phone, and a message box'
      ),
    }),
    []
  );

  const nameProperty = useMemo<StringProperty>(
    () => ({
      type: PropertyType.String,
      handle: 'name',
      label: translate('Form name') + ' (' + translate('optional') + ')',
      placeholder: translate('e.g. Contact Form'),
    }),
    []
  );

  useOnKeypress(
    {
      callback: (event: KeyboardEvent): void => {
        if (event.key !== 'Enter') return;
        const active = document.activeElement as HTMLElement | null;

        if (active?.id === 'prompt') {
          event.preventDefault();
          const nameInput = document.getElementById(
            'name'
          ) as HTMLInputElement as HTMLInputElement | null;
          nameInput?.focus({ preventScroll: true });
          return;
        }

        // For any other textarea, keep Enter for new lines.
        if (active?.tagName === 'TEXTAREA') return;

        handleSubmit();
      },
    },
    [integrationUid, prompt, name, isSubmitting, isLoadingIntegrations]
  );

  const handleSubmit = async (): Promise<void> => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setError(translate('Please describe the form you want to create.'));
      return;
    }
    if (!integrationUid) {
      setError(translate('Please select an AI integration.'));
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const { data: form } = await axios.post<Form>(
        '/api/forms/generate-from-ai',
        {
          prompt: trimmedPrompt,
          name: name.trim() || undefined,
          integrationUid,
        }
      );

      navigate(`/forms/${form.id}`);
      closeModal();
    } catch (err: unknown) {
      let message: string | null = null;
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: unknown } }).response?.data;
        if (typeof res === 'string') {
          message = res;
        } else if (
          res &&
          typeof res === 'object' &&
          'message' in res &&
          typeof (res as { message: unknown }).message === 'string'
        ) {
          message = (res as { message: string }).message;
        }
      }
      setError(
        message ||
          translate('Form generation failed. Please try again or rephrase.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalContainer>
      <ModalHeader>
        <h1>{translate('Create a form using AI')}</h1>
      </ModalHeader>

      <FormWrapper>
        <FormComponent
          property={integrationProperty}
          value={integrationUid}
          updateValue={(v) => setIntegrationUid(String(v ?? ''))}
          autoFocus
        />

        <FormComponent
          property={promptProperty}
          value={prompt}
          updateValue={(v) => setPrompt(String(v ?? ''))}
        />

        <FormComponent
          property={nameProperty}
          value={name}
          updateValue={(v) => setName(String(v ?? ''))}
        />

        {error && <ErrorBlock>{error}</ErrorBlock>}
      </FormWrapper>

      <ModalFooter>
        <button type="button" className="btn cancel" onClick={closeModal}>
          {translate('Close')}
        </button>
        <button
          type="button"
          className="btn submit"
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            !prompt.trim() ||
            !integrationUid ||
            isLoadingIntegrations
          }
        >
          <LoadingText
            loadingText={translate('Generating')}
            loading={isSubmitting}
            spinner
          >
            {translate('Generate form')}
          </LoadingText>
        </button>
      </ModalFooter>
    </ModalContainer>
  );
};
