import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import String from '@components/form-controls/control-types/string/string';
import type { IntegrationType } from '@ff-client/types/integrations';
import type { GenericValue } from '@ff-client/types/properties';
import { PropertyType } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import { useIntegrationNavigation } from '../sidebar/sidebar.queries';

import { Readme } from './readme/readme';
import { Titlebar } from './titlebar/titlebar';
import { EditorInput } from './editor.input';
import { EditorLoader } from './editor.loader';
import { useIntegrationProperties } from './editor.queries';
import {
  ActionsWrapper,
  EditorContainer,
  EditorTabsWrapper,
  EditorWrapper,
} from './editor.styles';

type Params = {
  type: IntegrationType;
  integration: string;
  id: string;
};

export const IntegrationsEditor: FC = () => {
  const { type, integration, id } = useParams<Params>();
  const { data, isFetching } = useIntegrationProperties(type, integration, id);
  const { data: navData } = useIntegrationNavigation();

  const [values, setValues] = useState<Record<string, GenericValue>>({});
  const [errors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (data) {
      const valueCollection = data.properties.reduce(
        (acc, property) => {
          acc[property.handle] = property.value;
          return acc;
        },
        {} as Record<string, GenericValue>
      );

      setValues({
        name: data.name,
        handle: data.handle,
        enabled: data.enabled,
        ...valueCollection,
      });
    }
  }, [data]);

  const isLoading = isFetching || !data;

  const saveHandler = (): void => {
    // handle save logic
  };

  const currentIntegrationInstances = navData
    ?.find((category) => category.handle === type)
    ?.entries?.find((entry) => entry.type.shortName === integration)?.instances;

  if (!type || !integration) {
    return null;
  }

  if (isLoading) {
    return (
      <EditorContainer>
        {currentIntegrationInstances &&
          currentIntegrationInstances.length > 1 && (
            <EditorTabsWrapper>
              {currentIntegrationInstances.map((instance) => (
                <NavLink
                  to={`../${type}/${integration}/${instance.id}`}
                  key={instance.id}
                >
                  <span>{instance.name}</span>
                </NavLink>
              ))}
            </EditorTabsWrapper>
          )}

        <ActionsWrapper>
          <button className="btn submit" onClick={saveHandler}>
            {translate('Save')}
          </button>
        </ActionsWrapper>

        <EditorLoader />
      </EditorContainer>
    );
  }

  return (
    <EditorContainer>
      {currentIntegrationInstances &&
        currentIntegrationInstances.length > 1 && (
          <EditorTabsWrapper>
            {currentIntegrationInstances.map((instance) => (
              <NavLink
                to={`../${type}/${integration}/${instance.id}`}
                key={instance.id}
              >
                <span>{instance.name}</span>
              </NavLink>
            ))}
          </EditorTabsWrapper>
        )}

      <ActionsWrapper>
        <button className="btn submit" onClick={saveHandler}>
          {translate('Save')}
        </button>
      </ActionsWrapper>

      <EditorWrapper>
        <Titlebar integration={data} />

        <hr />

        <String
          property={{
            handle: 'name',
            label: 'Name',
            required: true,
            instructions: translate(
              'What this integration will be called in the CP.'
            ),
            type: PropertyType.String,
          }}
          updateValue={(value) => {
            setValues((prev) => ({
              ...prev,
              name: value,
            }));
          }}
          value={values.name}
          errors={errors?.name}
          autoFocus
        />

        <String
          property={{
            handle: 'handle',
            label: 'Handle',
            required: true,
            flags: ['code'],
            instructions: translate(
              'The unique name used to identify this integration.'
            ),
            type: PropertyType.String,
          }}
          updateValue={(value) => {
            setValues((prev) => ({
              ...prev,
              handle: value,
            }));
          }}
          value={values.handle}
          errors={errors?.handle}
        />

        <hr />
        <Readme content={data.type.readmeContent} />
        <hr />

        {data.properties.map((property) => (
          <EditorInput
            key={property.handle}
            integration={data}
            property={property}
            values={values}
            errors={errors}
            onUpdate={(key, value) => {
              setValues((prev) => ({
                ...prev,
                [key]: value,
              }));
            }}
          />
        ))}
      </EditorWrapper>
    </EditorContainer>
  );
};
