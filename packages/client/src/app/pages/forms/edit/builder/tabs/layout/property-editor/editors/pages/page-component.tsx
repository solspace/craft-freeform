import React from 'react';
import type * as ControlTypes from '@components/form-controls';
import { FormComponent } from '@components/form-controls';
import type { Page } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { pageActions } from '@editor/store/slices/layout/pages';
import type { GenericValue, Property } from '@ff-client/types/properties';

type Props = {
  property: Property;
  page: Page;
};

export const PageComponent: React.FC<Props> = ({ property, page }) => {
  const dispatch = useAppDispatch();

  const updateValue: ControlTypes.UpdateValue<GenericValue> = (value) => {
    dispatch(
      pageActions.editButtons({ uid: page.uid, key: property.handle, value })
    );
  };

  const value = page.buttons?.[property.handle as keyof typeof page.buttons];

  return (
    <FormComponent
      value={value}
      property={property}
      updateValue={updateValue}
      context={page}
    />
  );
};
