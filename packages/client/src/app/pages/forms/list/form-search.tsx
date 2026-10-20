import translate from "@ff-client/utils/translations";
import { useRef } from "react";
import { SearchWrapper } from "./list-view.styles";

export type FormSearchProps = {
  search?: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export const FormSearch = ({ value, onChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const clear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  return (
    <SearchWrapper className="texticon">
      <span className="texticon-icon search icon" aria-hidden="true" />
      <input
        ref={inputRef}
        type="search"
        className="clearable text fullwidth"
        aria-label={translate("Search forms")}
        placeholder={translate("Search")}
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.preventDefault();
            event.stopPropagation();
            clear();
          }
        }}
      />
      {value && (
        <button
          className="clear-btn"
          type="button"
          aria-label={translate("Clear search")}
          title={translate("Clear search")}
          onClick={clear}
        />
      )}
    </SearchWrapper>
  );
};
