import translate from "@ff-client/utils/translations";
import type React from "react";

import { useFieldSearch } from "./hooks/use-field-search";
import SearchIconSVG from "./search.icon";
import { SearchBar, SearchBlock, SearchIcon, Wrapper } from "./search.style";

export const Search: React.FC = () => {
  const [query, setQuery] = useFieldSearch();

  return (
    <Wrapper>
      <SearchBlock>
        <SearchIcon>
          <SearchIconSVG />
        </SearchIcon>
        {/* <Filter /> */}
        <SearchBar
          type="text"
          placeholder={translate("Search")}
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
