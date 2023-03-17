import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { selectNotification } from '@ff-client/app/pages/forms/edit/store/slices/notifications';
import type { Notification as NotificationType } from '@ff-client/types/notifications';

import CogIcon from './cog-icon.svg';
import { Icon, Name, Status, Wrapper } from './notification.styles';

export const Notification: React.FC<NotificationType> = ({
  id,
  name,
  handle,
  icon,
}) => {
  const notification = useSelector(selectNotification(id));

  return (
    <Wrapper>
      <NavLink to={`${id}/${handle}`}>
        <Icon>
          {!!icon && <img src={icon} />}
          {!icon && <CogIcon />}
        </Icon>
        <Name>{name}</Name>
        <Status enabled={notification.enabled} />
      </NavLink>
    </Wrapper>
  );
};
