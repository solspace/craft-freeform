import camelCase from 'lodash.camelcase';
import { useContext, useEffect, useState } from 'react';

import axios from '@ff-app/config/axios';
import { ChangeHandler } from '@ff-app/shared/Forms/types';
import { generateUrl } from '@ff-app/utils/urls';

import { FormOptionsContext } from '../context/form-types-context';

export enum SuccessBehaviour {
  ReturnURL = 'redirect-return-url',
  Template = 'load-success-template',
  Reload = 'reload',
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
  successBehaviour: SuccessBehaviour;
  successTemplate?: string;
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
  const { ajaxByDefault } = useContext(FormOptionsContext);
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
    ajax: ajaxByDefault,
    storeData: true,
    successBehaviour: SuccessBehaviour.Reload,
    successTemplate: '',
    returnUrl: '',
  });

  useEffect(() => {
    setForm({ ...form, status: defaultStatusId, formTemplate: defaultTemplate, ajax: ajaxByDefault });
  }, [defaultStatusId, defaultTemplate, ajaxByDefault]);

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
        setIsSaving(false);
      });
  };

  return { form, errors, update, saveHandler, isSaving };
};
