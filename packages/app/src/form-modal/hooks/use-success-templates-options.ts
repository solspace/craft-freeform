import { useContext } from 'react';

import { SelectOption } from '@ff-app/shared/Forms/Select/Select';

import { FormOptionsContext } from '../context/form-types-context';
import { templateOptionMapper } from './use-form-templates-options';

export const useSuccessTempplatesOptions = (): SelectOption[] => {
  const { templates } = useContext(FormOptionsContext);

  if (templates === null) {
    return [{ label: 'Loading...' }];
  }

  return [{ label: '---' }].concat(templates.success.map(templateOptionMapper));
};
