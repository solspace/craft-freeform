import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import String from '@components/form-controls/control-types/string/string';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import type {
  APIError,
  ErrorCollection,
  ErrorList,
} from '@ff-client/types/api';
import { IntegrationType } from '@ff-client/types/integrations';
import type { GenericValue } from '@ff-client/types/properties';
import { PropertyType } from '@ff-client/types/properties';
import { generateHandle } from '@ff-client/utils/strings';
import translate from '@ff-client/utils/translations';

import { useIntegrationNavigation } from '../sidebar/sidebar.queries';

import { Readme } from './readme/readme';
import { Titlebar } from './titlebar/titlebar';
import { EditorInput } from './editor.input';
import { EditorLoader } from './editor.loader';
import {
  useIntegrationMutation,
  useIntegrationProperties,
} from './editor.queries';
import {
  ActionsWrapper,
  EditorContainer,
  EditorTabsWrapper,
  EditorWrapper,
} from './editor.styles';
import type { IntegrationState } from './editor.types';

type Params = {
  type: IntegrationType;
  integration: string;
  id: string;
};

export const IntegrationsEditor: FC = () => {
  const navigate = useNavigate();

  const { type, integration, id } = useParams<Params>();
  const { data, isFetching } = useIntegrationProperties(type, integration, id);
  const { data: navData } = useIntegrationNavigation();

  const [values, setValues] = useState<IntegrationState>({
    name: '',
    handle: '',
    enabled: true,
    metadata: {},
  });

  const [errors, setErrors] = useState<ErrorList | ErrorCollection>({});
  const { mutate, isLoading: isMutating } = useIntegrationMutation(
    data?.type.class,
    id,
    (error: APIError) => {
      if (!error.errors) {
        setErrors({});
        return;
      }

      const list: ErrorList = { metadata: {} };
      Object.entries(error.errors).forEach(([key, messages]) => {
        if (/^metadata\./.test(key)) {
          list.metadata[key.replace(/^metadata\./, '')] = messages;
        } else {
          list[key] = messages;
        }
      });

      setErrors(list);
    }
  );

  useEffect(() => {
    if (isMutating) {
      setErrors({});
    }
  }, [isMutating]);

  useEffect(() => {
    if (data) {
      const metadata = data.properties.reduce(
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
        metadata,
      });
    }
  }, [data]);

  const isAddNew = id === 'new';
  const isLoading = isFetching || !data;

  const saveHandler = (): void => {
    mutate(values);
  };

  const currentIntegrationInstances = navData
    ?.find((category) => category.handle === type)
    ?.entries?.find((entry) => entry.type.shortName === integration)?.instances;

  const instanceCount = currentIntegrationInstances?.length || 0;
  const showTabs = instanceCount > 1 || isAddNew;

  if (!type || !integration) {
    return null;
  }

  if (isLoading) {
    return (
      <EditorContainer>
        {showTabs && (
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
          <div className="btngroup">
            {instanceCount > 0 && type !== IntegrationType.Singles && (
              <button
                className="btn"
                title={translate('Add new integration of the same type')}
              >
                +
              </button>
            )}
            <button className="btn submit">{translate('Save')}</button>
          </div>
        </ActionsWrapper>

        <EditorLoader />
      </EditorContainer>
    );
  }

  return (
    <EditorContainer>
      {showTabs && (
        <EditorTabsWrapper>
          {currentIntegrationInstances.map((instance) => (
            <NavLink
              to={`../${type}/${integration}/${instance.id}`}
              key={instance.id}
            >
              <span>{instance.name}</span>
            </NavLink>
          ))}
          {isAddNew && (
            <a className="active">
              <span>{translate('Create a new instance')}</span>
            </a>
          )}
        </EditorTabsWrapper>
      )}

      <ActionsWrapper>
        <div className="btngroup">
          {instanceCount > 0 && type !== IntegrationType.Singles && (
            <button
              className="btn"
              onClick={() =>
                navigate(`/integrations/${type}/${integration}/new`)
              }
              title={translate('Add new integration of the same type')}
            >
              +
            </button>
          )}
          <button className="btn submit" onClick={saveHandler}>
            <LoadingText
              loading={isMutating}
              loadingText={translate('Saving')}
              spinner
            >
              {translate('Save')}
            </LoadingText>
          </button>
        </div>
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
              handle: generateHandle(value, {
                transliterate: true,
                camelize: true,
              }),
            }));
          }}
          value={values.name}
          errors={errors?.handle}
          autoFocus
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
                metadata: {
                  ...prev.metadata,
                  [key]: value,
                },
              }));
            }}
          />
        ))}
      </EditorWrapper>
    </EditorContainer>
  );
};
