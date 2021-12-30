import { useState } from 'react';
import axios from '@ff-app/config/axios';
import camelCase from 'lodash.camelcase';
import { generateUrl } from '@ff-app/utils/urls';
import { ChangeHandler } from '@ff-app/shared/Forms/types';

export enum SuccessBehavior {
  ReturnURL = 'returnUrl',
  Template = 'template',
  Nothing = 'nothing',
}

type FormData = {
  name: string;
  handle: string;
  type: string;
  submissionTitle: string;
  color?: string;
  formTemplate?: string;
  status?: number;
  ajax: boolean;
  storeData: boolean;
  successBehavior: SuccessBehavior;
  returnUrl?: string;
};

type FormSaveResponse = {
  id: number;
  handle: string;
};

type FormErrors = {
  [key: string]: string[];
};

type FormState = {
  form: FormData;
  errors: FormErrors;
  update: ChangeHandler;
  saveHandler: () => void;
  isSaving: boolean;
};

export const useFormState = (defaultStatusId: number, defaultTemplate: string): FormState => {
  const [isSaving, setIsSaving] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState<FormData>({
    name: '',
    handle: '',
    type: 'Solspace\\Freeform\\Form\\Types\\Regular',
    submissionTitle: '{{ dateCreated|date("Y-m-d H:i:s") }}',
    color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    formTemplate: defaultTemplate,
    status: defaultStatusId,
    ajax: true,
    storeData: true,
    successBehavior: SuccessBehavior.ReturnURL,
    returnUrl: '',
  });

  const update: ChangeHandler = (name, value): void => {
    const payload = { ...form, [name]: value };
    if (name === 'name') {
      payload.handle = camelCase(value as string);
    }

    if (name === 'handle') {
      payload.handle = payload.handle.replace(/[^a-zA-Z0-9\-_]/g, '');
    }

    setForm(payload);
  };

  const saveHandler = (): void => {
    setIsSaving(true);
    setErrors({});

    axios
      .post<FormSaveResponse>('/api/forms', form)
      .then(({ data: { id } }) => {
        window.location.href = generateUrl(`/forms/${id}`);
      })
      .catch((error) => {
        setErrors(error.response.data.errors as FormErrors);
      })
      .finally((): void => setIsSaving(false));
  };

  return { form, errors, update, saveHandler, isSaving };
};
