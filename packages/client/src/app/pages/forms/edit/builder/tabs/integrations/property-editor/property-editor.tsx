import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Bool from '@components/form-controls/control-types/bool/bool';
import { useAppDispatch } from '@editor/store';
import {
  selectIntegration,
  toggleIntegration,
} from '@editor/store/slices/integrations';
import { Space } from '@ff-client/app/components/layout/blocks/space';
import { PropertyType } from '@ff-client/types/properties';

import { EmptyEditor } from './empty-editor';
import { FieldComponent } from './field-component';
import {
  PropertyEditorWrapper,
  SettingsWrapper,
} from './property-editor.styles';

type UrlParams = {
  id: string;
  formId: string;
};

export const PropertyEditor: React.FC = () => {
  const { id: integrationId } = useParams<UrlParams>();
  const dispatch = useAppDispatch();

  const integration = useSelector(selectIntegration(Number(integrationId)));
  if (!integration) {
    return <EmptyEditor />;
  }

  const { id, handle, enabled, name, description, properties } = integration;

  return (
    <PropertyEditorWrapper>
      <h1 title={handle}>{name}</h1>
      {!!description && <p>{description}</p>}

      <Bool
        property={{
          label: 'Enabled',
          handle: 'enabled',
          type: PropertyType.Boolean,
        }}
        value={enabled}
        updateValue={() => dispatch(toggleIntegration(id))}
      />

      <Space />

      <SettingsWrapper>
        {properties.map((property) => (
          <FieldComponent
            key={property.handle}
            integration={integration}
            property={property}
          />
        ))}
      </SettingsWrapper>
    </PropertyEditorWrapper>
  );
};
