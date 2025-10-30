import type { PropsWithChildren } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import config from '@config/freeform/freeform.config';
import { useAppDispatch } from '@editor/store';
import { addNewNotification } from '@editor/store/thunks/notifications';
import type { NotificationType } from '@ff-client/types/notifications';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import { capitalize } from 'lodash';
import { v4 } from 'uuid';

import { Icon, Link } from './item.styles';
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
  const { name, edition } = type;

  const { isAtLeast } = config.editions;

  if (!isAtLeast(type.edition)) {
    return (
      <Wrapper>
        <LabelWrapper>
          <Label>{translate(name)}</Label>
        </LabelWrapper>
        <NotificationItemWrapper style={{ opacity: 0.7 }}>
          <Link
            className="flex"
            to={Craft.getCpUrl('plugin-store/freeform')}
            target="_blank"
          >
            <Icon className={classes('disabled-icon')}>
              <i className="fa-thin fa-star-exclamation" />
            </Icon>
            <span className={classes('edition-label')}>
              {translate('Upgrade to {edition} to enable', {
                edition: capitalize(edition),
              })}
            </span>
          </Link>
        </NotificationItemWrapper>
      </Wrapper>
    );
  }

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
