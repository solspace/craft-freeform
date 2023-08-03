import React from 'react';
import Skeleton from 'react-loading-skeleton';

import { ButtonGroup, ButtonGroupWrapper } from './page-buttons.styles';

export const LoaderPageButtons: React.FC = () => {
  return (
    <ButtonGroupWrapper>
      <ButtonGroup />
      <ButtonGroup>
        <button className="btn submit">
          <Skeleton width={50} baseColor="#e12d39" />
        </button>
      </ButtonGroup>
    </ButtonGroupWrapper>
  );
};
