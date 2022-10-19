import translate from '@ff-client/utils/translations';
import React from 'react';

import { Filter } from './filter/filter';
import { useFieldSearch } from './hooks/use-field-search';
import { SearchBar, SearchBlock, SearchIcon, Wrapper } from './search.style';
import SearchIconSVG from './search.svg';

export const Search: React.FC = () => {
  const [query, setQuery] = useFieldSearch();

  return (
    <Wrapper>
      <SearchBlock>
        <SearchIcon>
          <SearchIconSVG />
        </SearchIcon>
        <Filter />
        <SearchBar
          type="text"
          placeholder={translate('Search fields...')}
          className="fullwidth text"
          value={query}
          onChange={(event): void => {
            setQuery(event.target.value);
          }}
        />
      </SearchBlock>
    </Wrapper>
  );
};
