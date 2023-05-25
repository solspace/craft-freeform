import { Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';

import axios from '@ff-app/config/axios';
import { generateUrl } from '@ff-app/utils/urls';

import { FormOptionsContext } from '../context/form-types-context';
import { v4 } from 'uuid';

export enum SuccessBehavior {
  ReturnURL = 'redirect-return-url',
  Template = 'load-success-template',
  Reload = 'reload',
}

type FormData = {
  uid: string;
  type: string;
  settings: {
    behavior: {
      ajax: boolean;
      successBehavior: SuccessBehavior;
      returnUrl: string;
      successTemplate: string;
    };
    general: {
      name: string;
      handle: string;
      color: string;
      submissionTitle: string;
      defaultStatus: number;
      storeData: boolean;
      formattingTemplate: string;
    };
  };
};

type FormSaveResponse = {
  form: {
    id: number;
    handle: string;
  };
};

type FormErrors = {
  [key: string]: string[];
};

type FormState = {
  form: FormData;
  errors: FormErrors;
  update: Dispatch<SetStateAction<FormData>>;
  saveHandler: () => void;
  isSaving: boolean;
};

export const useFormState = (defaultStatusId: number, defaultTemplate: string): FormState => {
  const { ajaxByDefault } = useContext(FormOptionsContext);
  const [isSaving, setIsSaving] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [form, setForm] = useState<FormData>({
    uid: v4(),
    type: 'Solspace\\Freeform\\Form\\Types\\Regular',
    settings: {
      behavior: {
        ajax: ajaxByDefault,
        successBehavior: SuccessBehavior.Reload,
        successTemplate: '',
        returnUrl: '',
      },
      general: {
        name: '',
        handle: '',
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
        submissionTitle: '{{ dateCreated|date("Y-m-d H:i:s") }}',
        defaultStatus: defaultStatusId,
        formattingTemplate: defaultTemplate,
        storeData: true,
      },
    },
  });

  useEffect(() => {
    setForm({
      ...form,
      settings: {
        behavior: {
          ...form.settings.behavior,
          ajax: ajaxByDefault,
        },
        general: {
          ...form.settings.general,
          defaultStatus: defaultStatusId,
          formattingTemplate: defaultTemplate,
        },
      },
    });
  }, [defaultStatusId, defaultTemplate, ajaxByDefault]);

  const saveHandler = (): void => {
    setIsSaving(true);
    setErrors({});

    axios
      .post<FormSaveResponse>('/api/forms', { form })
      .then(({ data }) => {
        window.location.href = generateUrl(`/forms/${data.form.id}`);
      })
      .catch((error) => {
        setErrors(error.response.data.errors as FormErrors);
        setIsSaving(false);
      });
  };

  return { form, errors, update: setForm, saveHandler, isSaving };
};
