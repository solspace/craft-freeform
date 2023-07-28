import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Bool from '@components/form-controls/control-types/bool/bool';
import { useAppDispatch } from '@editor/store';
import { integrationActions } from '@editor/store/slices/integrations';
import { integrationSelectors } from '@editor/store/slices/integrations/integrations.selectors';
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

  const integration = useSelector(
    integrationSelectors.one(Number(integrationId))
  );
  if (!integration) {
    return <EmptyEditor />;
  }

  const { id, handle, enabled, name, description, properties } = integration;

  return (
    <PropertyEditorWrapper>
      <h1 title={handle}>{name}</h1>
      {!!description && <p>{description}</p>}

      <SettingsWrapper>
        {/* REFACTOR - so it comes from the Integration type class, like the other fields and has correct animations applied */}
        <div style={{ paddingBottom: '10px', marginBottom: '2px' }}>
          <Bool
            property={{
              label: 'Enabled',
              handle: 'enabled',
              type: PropertyType.Boolean,
            }}
            value={enabled}
            updateValue={() => dispatch(integrationActions.toggle(id))}
          />
        </div>

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
