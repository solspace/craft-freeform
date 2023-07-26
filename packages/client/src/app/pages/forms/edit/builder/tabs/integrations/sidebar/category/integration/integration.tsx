import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { integrationSelectors } from '@editor/store/slices/integrations/integrations.selectors';
import type { Integration as IntegrationType } from '@ff-client/types/integrations';
import classes from '@ff-client/utils/classes';

import CogIcon from './cog-icon.svg';
import { Icon, Name, Status, Wrapper } from './integration.styles';

export const Integration: React.FC<IntegrationType> = ({
  id,
  name,
  handle,
  icon,
}) => {
  const integration = useSelector(integrationSelectors.one(id));

  return (
    <Wrapper>
      <NavLink
        to={`${id}/${handle}`}
        className={classes(!integration.enabled && 'inactive')}
      >
        <Icon>
          {!!icon && <img src={icon} />}
          {!icon && <CogIcon />}
        </Icon>
        <Name>{name}</Name>
        <Status enabled={integration.enabled} className={classes('status-dot')} />
      </NavLink>
    </Wrapper>
  );
};
