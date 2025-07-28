import React from 'react';
import translate from '@ff-client/utils/translations';

import { SearchBar, SearchBlock, SearchIcon, Wrapper } from './search.style';
import SearchIconSVG from './search.svg';

type Props = {
  placeholder?: string;
  query: string;
  setQuery?: (value: string) => void;
};

export const Search: React.FC<Props> = ({ placeholder, query, setQuery }) => {
  return (
    <Wrapper>
      <SearchBlock>
        <SearchIcon>
          <SearchIconSVG />
        </SearchIcon>

        <SearchBar
          type="text"
          placeholder={translate(placeholder || 'Search')}
          className="fullwidth text"
          value={query}
          onChange={(event): void => {
            setQuery?.(event.target.value);
          }}
        />
      </SearchBlock>
    </Wrapper>
  );
};
