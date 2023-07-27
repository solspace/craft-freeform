import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@editor/store';
import { removeNotification } from '@editor/store/thunks/notifications';
import type { Notification } from '@ff-client/types/notifications';

import DeleteIcon from './delete.svg';
import { useRemoveAnimation } from './remove.animations';
import { RemoveButtonWrapper } from './remove.styles';

type Props = {
  notification: Notification;
};

export const Remove: React.FC<Props> = ({ notification }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [hovering, setHovering] = useState(false);
  const animation = useRemoveAnimation({ hovering });

  return (
    <RemoveButtonWrapper
      style={animation}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => {
        dispatch(removeNotification(notification));
        navigate('..');
      }}
    >
      <DeleteIcon />
    </RemoveButtonWrapper>
  );
};
