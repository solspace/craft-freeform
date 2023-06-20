import React from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@editor/store';
import { contextActions } from '@editor/store/slices/context';
import { pageSelecors } from '@editor/store/slices/layout/pages/pages.selectors';
import CloseIcon from '@ff-client/assets/icons/circle-xmark-solid.svg';

import { CloseLink, Title } from '../../property-editor.styles';

import { PagePropertiesWrapper } from './page-properties.styles';

type Props = {
  uid: string;
};

export const PageProperties: React.FC<Props> = ({ uid }) => {
  const dispatch = useAppDispatch();

  const page = useSelector(pageSelecors.one(uid));

  return (
    <PagePropertiesWrapper>
      <CloseLink onClick={() => dispatch(contextActions.unfocus())}>
        <CloseIcon />
      </CloseLink>
      <Title>
        <span>{page.label}</span>
      </Title>
      Page props {uid}
    </PagePropertiesWrapper>
  );
};
