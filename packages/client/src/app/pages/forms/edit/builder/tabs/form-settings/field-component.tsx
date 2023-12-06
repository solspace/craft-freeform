import React from 'react';
import { useSelector } from 'react-redux';
import { FormComponent } from '@components/form-controls';
import { useAppDispatch } from '@editor/store';
import { useValueUpdateGenerator } from '@editor/store/hooks/value-update-generator';
import { formActions } from '@editor/store/slices/form';
import { formSelectors } from '@editor/store/slices/form/form.selectors';
import { useQueryFormSettings } from '@ff-client/queries/forms';
import type { Property } from '@ff-client/types/properties';

type Props = {
  namespace: string;
  property: Property;
};

export const FieldComponent: React.FC<Props> = ({ namespace, property }) => {
  const dispatch = useAppDispatch();
  const { data } = useQueryFormSettings();

  const properties = data.find(
    (setting) => setting.handle === namespace
  ).properties;

  const formErrors = useSelector(formSelectors.errors);
  const form = useSelector(formSelectors.current);
  const settings = useSelector(formSelectors.settings.one(namespace));

  const context = {
    ...settings,
    isNew: form.isNew,
  };

  const value = context[property.handle];

  const generateUpdateHandler = useValueUpdateGenerator(
    properties,
    context,
    (handle, value) => {
      dispatch(
        formActions.modifySettings({
          namespace,
          key: handle,
          value,
        })
      );
    }
  );

  const errors: string[] | undefined =
    formErrors?.[namespace]?.[property.handle];

  return (
    <FormComponent
      value={value}
      property={property}
      updateValue={generateUpdateHandler(property)}
      errors={errors}
      context={context}
    />
  );
};
