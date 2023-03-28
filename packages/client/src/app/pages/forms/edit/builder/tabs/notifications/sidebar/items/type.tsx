import type { PropsWithChildren } from 'react';
import React from 'react';
import type { NotificationType } from '@ff-client/types/notifications';

import {
  Icon,
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
  const { name, icon } = type;

  return (
    <Wrapper>
      <LabelWrapper>
        {icon && <Icon dangerouslySetInnerHTML={{ __html: icon }} />}
        <Label>{name}</Label>
      </LabelWrapper>
      <NotificationItemWrapper>{children}</NotificationItemWrapper>
    </Wrapper>
  );
};
