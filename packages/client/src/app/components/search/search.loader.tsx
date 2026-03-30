import translate from "@ff-client/utils/translations";
import type React from "react";
import SearchIconSVG from "./search.icon";
import { SearchBar, SearchBlock, SearchIcon, Wrapper } from "./search.style";
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
          placeholder={translate("Search")}
        />
      </SearchBlock>
    </Wrapper>
  );
};
