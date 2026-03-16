import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import String from '@components/form-controls/control-types/string/string';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import config from '@config/freeform/freeform.config';
import { useSaveShortcut } from '@ff-client/hooks/use-save-shortcut';
import type {
  APIError,
  ErrorCollection,
  ErrorList,
} from '@ff-client/types/api';
import { IntegrationType } from '@ff-client/types/integrations';
import type { GenericValue } from '@ff-client/types/properties';
import { PropertyType } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import { generateHandle } from '@ff-client/utils/strings';
import translate from '@ff-client/utils/translations';

import { useIntegrationNavigation } from '../sidebar/sidebar.queries';

import { Titlebar } from './titlebar/titlebar';
import { EditorInput } from './editor.input';
import { EditorLoader } from './editor.loader';
import { VersionUpgradeOverlay } from './editor.overlay';
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

  useEffect(() => {
    if (navData && integration && !id) {
      const category = navData.find((cat) => cat.handle === type);
      if (!category) {
        return;
      }

      const entry = category.entries.find(
        (entry) => entry.type.shortName === integration
      );

      if (entry) {
        const firstInstance = entry.instances?.[0];
        if (firstInstance) {
          navigate(`/integrations/${type}/${integration}/${firstInstance.id}`);

          return;
        }
      }
    }
  }, [navData]);

  const [values, setValues] = useState<IntegrationState>({
    name: '',
    handle: '',
    enabled: true,
    metadata: {},
  });

  const [errors, setErrors] = useState<ErrorList | ErrorCollection>({});
  const { mutate, isPending: isMutating } = useIntegrationMutation(
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

  const canManage = config.permissions.integrations === 'manage';
  const isAddNew = id === 'new';
  const isLoading = isFetching || !data;

  const saveHandler = (): void => {
    if (data?.supported) {
      mutate(values);
    }
  };

  useSaveShortcut(saveHandler);

  const currentIntegrationInstances = navData
    ?.find((category) => category.handle === type)
    ?.entries?.find((entry) => entry.type.shortName === integration)?.instances;

  const instanceCount = currentIntegrationInstances?.length || 0;
  const showTabs = instanceCount > 1 || isAddNew;
  const isSingleton = Boolean(data?.type?.singleton);
  const showAddButton =
    instanceCount > 0 && type !== IntegrationType.Singles && !isSingleton;

  if (!type || !integration) {
    return null;
  }

  if (isLoading) {
    return (
      <EditorContainer>
        {showTabs && (
          <EditorTabsWrapper>
            {currentIntegrationInstances?.map((instance) => (
              <NavLink
                to={`../${type}/${integration}/${instance.id}`}
                key={instance.id}
              >
                <span>{instance.name}</span>
              </NavLink>
            ))}
          </EditorTabsWrapper>
        )}

        {canManage && (
          <ActionsWrapper>
            <div className="btngroup">
              {showAddButton && (
                <button
                  className={classes('btn', 'add', 'icon', 'disabled')}
                  title={translate('Add new integration of the same type')}
                />
              )}
              <button
                className={classes(
                  'btn',
                  data?.supported && 'submit',
                  'disabled'
                )}
              >
                {translate('Save')}
              </button>
            </div>
          </ActionsWrapper>
        )}

        <EditorLoader />
      </EditorContainer>
    );
  }

  return (
    <EditorContainer>
      <Breadcrumb
        id="integration-edit"
        label={data.name}
        url={`integrations/${type}/${integration}${id ? `/${id}` : ''}`}
      />

      <VersionUpgradeOverlay integration={data} />

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

      {canManage && (
        <ActionsWrapper>
          <div className="btngroup">
            {showAddButton && (
              <button
                className={classes(
                  'btn',
                  'add',
                  'icon',
                  !data.supported && 'disabled'
                )}
                onClick={() =>
                  navigate(`/integrations/${type}/${integration}/new`)
                }
                title={translate('Add new integration of the same type')}
              />
            )}
            <button
              className={classes('btn', data.supported ? 'submit' : 'disabled')}
              onClick={saveHandler}
            >
              <LoadingText
                loading={isMutating}
                loadingText={translate('Saving...')}
                spinner
              >
                {translate('Save')}
              </LoadingText>
            </button>
          </div>
        </ActionsWrapper>
      )}

      <EditorWrapper>
        <Titlebar integration={data} />

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
          autoFocus={data.supported}
        />

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
