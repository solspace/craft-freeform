import { Lightswitch } from '@ff-client/app/components/form-controls/inputs/lightswitch';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import {
  selectIntegration,
  toggleIntegration,
} from '../../../../store/slices/integrations';
import { Wrapper } from './editor.styles';
import { EmptyEditor } from './empty-editor';
import { Setting } from './setting/setting';

type UrlParams = {
  id: string;
  formId: string;
};

export const Editor: React.FC = () => {
  const { id: integrationId } = useParams<UrlParams>();
  const dispatch = useDispatch();

  const integration = useSelector(selectIntegration(Number(integrationId)));
  if (!integration) {
    return <EmptyEditor />;
  }

  const { id, handle, name, description, enabled, settings } = integration;

  return (
    <Wrapper>
      <h1 title={handle}>{name}</h1>
      {!!description && <p>{description}</p>}

      <Lightswitch
        label="Enabled"
        onChange={(): void => {
          dispatch(toggleIntegration(id));
        }}
        value={enabled}
      />

      {settings.map((setting) => (
        <Setting key={setting.handle} id={id} setting={setting} />
      ))}
    </Wrapper>
  );
};
