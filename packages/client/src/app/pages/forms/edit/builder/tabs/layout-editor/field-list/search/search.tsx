import translate from '@ff-client/utils/translations';
import React from 'react';
import { useFieldSearch } from './hooks/use-field-search';
import {
  SearchIcon,
  SearchBlock,
  Wrapper,
  FilterIcon,
  SearchBar,
} from './search.style';
import SearchIconSVG from './search.svg';
import FilterIconSVG from './sliders.svg';

export const Search: React.FC = () => {
  const [query, setQuery] = useFieldSearch();

  return (
    <Wrapper>
      <SearchBlock>
        <SearchIcon>
          <SearchIconSVG />
        </SearchIcon>
        <FilterIcon>
          <FilterIconSVG />
        </FilterIcon>
        <SearchBar
          type="text"
          placeholder={translate('Search for fields...')}
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
