import type { ReactNode } from 'react';
import React from 'react';
import config from '@config/freeform/freeform.config';

import CircleIcon from './icons/circle.icon.svg';
import DeleteIcon from './icons/delete.icon.svg';
import InfoIcon from './icons/info.icon.svg';
import NewIcon from './icons/new.icon.svg';
import TriangleIcon from './icons/triangle.icon.svg';
import { useNoticeDeleteMutation, useNoticesQuery } from './notices.queries';
import {
  CloseButton,
  Icon,
  Message,
  NoticeItem,
  NoticesList,
} from './notices.styles';

const icons: Record<string, ReactNode> = {
  info: <InfoIcon />,
  warning: <TriangleIcon />,
  error: <CircleIcon />,
  new: <NewIcon />,
};

export const Notices: React.FC = () => {
  const { data, isFetching } = useNoticesQuery();
  const mutation = useNoticeDeleteMutation();

  if (!config.feed) {
    return null;
  }

  if (!data && isFetching) {
    return null;
  }

  if (!data.length) {
    return null;
  }

  return (
    <NoticesList>
      {data.map((notice) => (
        <NoticeItem key={notice.id} data-type={notice.type}>
          <Icon>{icons[notice.type]}</Icon>
          <Message>{notice.message}</Message>

          <CloseButton onClick={() => mutation.mutate(notice.id)}>
            <DeleteIcon />
          </CloseButton>
        </NoticeItem>
      ))}
    </NoticesList>
  );
};
