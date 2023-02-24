import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Bool from '@components/__refactor/form-controls/controls/bool';
import { useAppDispatch } from '@editor/store';
import { Space } from '@ff-client/app/components/layout/blocks/space';
import { PropertyType } from '@ff-client/types/properties';

import {
  selectIntegration,
  toggleIntegration,
} from '../../../../store/slices/integrations';

import { EditorWrapper, SettingsWrapper } from './editor.styles';
import { EmptyEditor } from './empty-editor';
import { FieldComponent } from './field-component';

type UrlParams = {
  id: string;
  formId: string;
};

export const Editor: React.FC = () => {
  const { id: integrationId } = useParams<UrlParams>();
  const dispatch = useAppDispatch();

  const integration = useSelector(selectIntegration(Number(integrationId)));
  if (!integration) {
    return <EmptyEditor />;
  }

  const { id, handle, enabled, name, description, properties } = integration;

  // TODO: refactor Integrations to use #[Property] instead

  return (
    <EditorWrapper>
      <h1 title={handle}>{name}</h1>
      {!!description && <p>{description}</p>}

      <Bool
        property={{
          label: 'Enabled',
          handle: 'enabled',
          type: PropertyType.Boolean,
        }}
        value={enabled}
        onUpdateValue={() => dispatch(toggleIntegration(id))}
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
    </EditorWrapper>
  );
};
