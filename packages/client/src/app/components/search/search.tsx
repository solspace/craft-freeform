import translate from "@ff-client/utils/translations";
import type React from "react";

import { useSearchFocus } from "./search.hooks";
import SearchIconSVG from "./search.icon";
import {
  SearchBar,
  SearchBlock,
  SearchIcon,
  SearchKeyHelper,
  Wrapper,
} from "./search.style";

type Props = {
  placeholder?: string;
  query: string;
  setQuery?: (value: string) => void;
};

export const Search: React.FC<Props> = ({ placeholder, query, setQuery }) => {
  const ref = useSearchFocus();

  return (
    <Wrapper>
      <SearchBlock>
        <SearchIcon>
          <SearchIconSVG />
        </SearchIcon>

        <SearchKeyHelper>{"/"}</SearchKeyHelper>

        <SearchBar
          ref={ref}
          type="text"
          placeholder={translate(placeholder || "Search")}
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
