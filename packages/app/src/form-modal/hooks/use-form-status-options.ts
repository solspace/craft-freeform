import { SelectOption } from '@ff-app/shared/Forms/Select/Select';
import { useContext } from 'react';
import { FormOptionsContext } from '../context/form-types-context';

export const useFormStatusOptions = (): [number, SelectOption[]] => {
  const { statuses } = useContext(FormOptionsContext);

  if (statuses === null) {
    return [1, [{ label: 'Loading...' }]];
  }

  const defaultId = statuses.find(({ isDefault }) => isDefault)?.id;
  const options = statuses.map(({ name, id }) => ({
    label: name,
    value: id,
  }));

  return [defaultId, options];
};
