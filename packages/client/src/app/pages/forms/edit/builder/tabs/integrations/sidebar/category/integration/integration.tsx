import { Integration as IntegrationType } from '@ff-client/types/integrations';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Icon, Name, Status, Wrapper } from './integration.styles';
import CogIcon from './cog-icon.svg';
import { useSelector } from 'react-redux';
import { selectIntegration } from '@ff-client/app/pages/forms/edit/store/slices/integrations';

export const Integration: React.FC<IntegrationType> = ({
  id,
  name,
  handle,
  icon,
}) => {
  const integration = useSelector(selectIntegration(id));

  return (
    <Wrapper>
      <NavLink to={`${id}/${handle}`}>
        <Icon>
          {!!icon && <img src={icon} />}
          {!icon && <CogIcon />}
        </Icon>
        <Name>{name}</Name>
        <Status enabled={integration.enabled} />
      </NavLink>
    </Wrapper>
  );
};
