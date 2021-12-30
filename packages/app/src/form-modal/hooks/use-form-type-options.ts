import { SelectOption } from '@ff-app/shared/Forms/Select/Select';
import { useContext } from 'react';
import { FormOptionsContext } from '../context/form-types-context';

export const useFormTypeOptions = (): SelectOption[] => {
  const { types } = useContext(FormOptionsContext);

  if (types === null) {
    return [{ label: 'Loading...' }];
  }

  return types.map(({ name, className }) => ({
    label: name,
    value: className,
  }));
};
