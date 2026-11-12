import translate from "@ff-client/utils/translations";
import { createElement, useRef } from "react";
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
      {createElement("craft-icon", {
        className: "texticon-icon",
        name: "magnifying-glass",
        "aria-hidden": true,
      })}
      <input
        ref={inputRef}
        type="search"
        className="cp-form-control fullwidth"
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
        >
          {createElement("craft-icon", { name: "xmark", "aria-hidden": true })}
        </button>
      )}
    </SearchWrapper>
  );
};
