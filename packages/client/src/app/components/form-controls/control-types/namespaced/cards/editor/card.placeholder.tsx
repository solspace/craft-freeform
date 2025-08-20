import type { FC } from 'react';
import React from 'react';
import { colors } from '@ff-client/styles/variables';
import translate from '@ff-client/utils/translations';
import styled from 'styled-components';

type Props = {
  onClick: () => void;
};

export const CardPlaceholder: FC<Props> = ({ onClick }) => {
  return (
    <CardPlaceholderWrapper onClick={onClick}>
      {translate('Add Card')}
    </CardPlaceholderWrapper>
  );
};

const CardPlaceholderWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 10px;

  border: 2px dashed ${colors.gray200};
  border-radius: 10px;

  text-align: center;
  font-size: 18px;
  color: ${colors.gray400};

  user-select: none;

  &:hover {
    background-color: ${colors.gray100};
  }
`;
