import type { PropsWithChildren } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@editor/store';
import { addNewNotification } from '@editor/store/thunks/notifications';
import type { NotificationType } from '@ff-client/types/notifications';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import { v4 } from 'uuid';

import {
  Button,
  Label,
  LabelWrapper,
  NotificationItemWrapper,
  Wrapper,
} from './type.styles';

type Props = {
  type: NotificationType;
};

export const NotificationTypeItem: React.FC<PropsWithChildren<Props>> = ({
  type,
  children,
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { name } = type;

  return (
    <Wrapper>
      <LabelWrapper>
        <Label>{translate(name)}</Label>
        <Button
          className={classes('btn', 'add', 'icon', 'small', 'dashed')}
          onClick={() => {
            const uid = v4();
            dispatch(addNewNotification(type, uid));
            navigate(uid);
          }}
        >
          {translate('New')}
        </Button>
      </LabelWrapper>
      <NotificationItemWrapper>{children}</NotificationItemWrapper>
    </Wrapper>
  );
};
