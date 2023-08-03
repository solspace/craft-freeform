import React from 'react';
import translate from '@ff-client/utils/translations';

import { SearchBar, SearchBlock, SearchIcon, Wrapper } from './search.style';
import SearchIconSVG from './search.svg';
export const LoaderSearch: React.FC = () => {
  return (
    <Wrapper>
      <SearchBlock>
        <SearchIcon>
          <SearchIconSVG />
        </SearchIcon>
        <SearchBar
          disabled
          className="fullwidth text"
          placeholder={translate('Search')}
        />
      </SearchBlock>
    </Wrapper>
  );
};
