import SpinnerIcon from "@components/loaders/spinner";
import { useEscapeStack } from "@ff-client/contexts/escape/escape.context";
import { useClickOutside } from "@ff-client/hooks/use-click-outside";
import { useOnKeypress } from "@ff-client/hooks/use-on-keypress";
import type { Option, OptionCollection } from "@ff-client/types/properties";
import classes from "@ff-client/utils/classes";
import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RecommendedBadge } from "../badges/recommended-badge";

import { PopUpPortal } from "../pop-up-portal";

import CloseIcon from "./close";
import {
  findOptionByValue,
  findShadowIndexByValue,
  findValueByShadowIndex,
  useFilteredOptions,
} from "./dropdown.operations";
import { Options } from "./dropdown.options";
import { useDropdownPosition } from "./dropdown.position";
import {
  CloseButton,
  CurrentValue,
  DropdownRollout,
  DropdownWrapper,
  Icon,
  ListWrapper,
  Search,
  SearchRow,
  SpinnerWrapper,
} from "./dropdown.styles";

export type DropdownProps = {
  loading?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  emptyOption?: string;
  missingOption?: Pick<Option, "label" | "icon">;
  options?: OptionCollection;
  value?: string | number;
  showValues?: boolean;
  showHints?: boolean;
  showSelectedIcon?: boolean;
  recommendedValue?: string;
  onChange?: (value: string) => void;
  className?: string;
};

export const Dropdown: React.FC<DropdownProps> = ({
  emptyOption,
  missingOption,
  value,
  options,
  showValues,
  showHints,
  showSelectedIcon,
  recommendedValue,
  onChange,
  className,
  loading = false,
  disabled = false,
  ariaLabel,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focusIndex, setFocusIndex] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useClickOutside<HTMLDivElement>({
    callback: () => setOpen(false),
    isEnabled: open,
    excludeClassNames: ["dropdown-rollout"],
  });

  const menuPosition = useDropdownPosition(containerRef, dropdownRef, open);

  const toggleOpen = useCallback(() => {
    if (!loading && !disabled) {
      setOpen(!open);
    }
  }, [loading, disabled, open]);

  const [filteredOptions, optionCount] = useFilteredOptions(
    options,
    query,
    emptyOption,
  );

  const selectedOption = useMemo(
    () => findOptionByValue(options, value),
    [options, value],
  );
  const missingValue = missingOption && !!value && !selectedOption;

  const selectedIndex = useMemo(
    () => findShadowIndexByValue(filteredOptions, value),
    [filteredOptions, value],
  );

  useEscapeStack(() => setOpen(false), open);

  useOnKeypress(
    {
      meetsCondition: open,
      type: "keydown",
      callback: (event) => {
        if (event.key === "ArrowDown" && focusIndex < optionCount - 1) {
          setFocusIndex((prev) => prev + 1);
        }

        if (event.key === "ArrowUp" && focusIndex > 0) {
          setFocusIndex((prev) => prev - 1);
        }
      },
    },
    [focusIndex, optionCount],
  );

  useOnKeypress(
    {
      meetsCondition: open,
      type: "keyup",
      callback: (event) => {
        if (event.key === "Enter") {
          const value = findValueByShadowIndex(filteredOptions, focusIndex);
          onChange?.(value);
          setOpen(false);
        }
      },
    },
    [filteredOptions, focusIndex],
  );

  useEffect(() => {
    if ((loading || disabled) && open) {
      setOpen(false);
    }
  }, [loading, disabled, open]);

  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
      setFocusIndex(selectedIndex || 0);
    } else {
      setQuery("");
    }
  }, [open, selectedIndex]);

  const onOptionClick = useCallback(
    (value: string) => {
      onChange?.(value);
      setOpen(false);
    },
    [onChange],
  );

  return (
    <DropdownWrapper
      ref={containerRef}
      className={classes(open && "open", disabled && "readonly", className)}
      role={ariaLabel ? "combobox" : undefined}
      aria-label={ariaLabel}
      aria-expanded={ariaLabel ? open : undefined}
      aria-haspopup={ariaLabel ? "listbox" : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={ariaLabel && !disabled ? 0 : undefined}
      onKeyDown={(event) => {
        if (!ariaLabel || event.target !== event.currentTarget) return;
        if (["Enter", " ", "ArrowDown"].includes(event.key)) {
          event.preventDefault();
          toggleOpen();
        }
      }}
      onClick={toggleOpen}
    >
      <CurrentValue
        className={classes(
          loading && "disabled",
          (value === "" || value === null) && "empty",
          missingValue && "missing",
        )}
      >
        {missingValue && missingOption.icon ? (
          <Icon aria-hidden="true">{missingOption.icon}</Icon>
        ) : (
          showSelectedIcon &&
          selectedOption?.icon && <Icon>{selectedOption.icon}</Icon>
        )}
        <span
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              missingValue
                ? missingOption.label
                : selectedOption?.label || translate(emptyOption),
            ),
          }}
        />
        {recommendedValue !== undefined && value === recommendedValue && (
          <RecommendedBadge />
        )}
        {loading && (
          <SpinnerWrapper>
            <SpinnerIcon />
          </SpinnerWrapper>
        )}
      </CurrentValue>
      <PopUpPortal>
        {open && (
          <DropdownRollout
            className="dropdown-rollout"
            ref={dropdownRef}
            style={menuPosition}
          >
            <SearchRow>
              <Search
                placeholder={translate("Search...")}
                ref={searchRef}
                value={query}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => {
                  if (["ArrowUp", "ArrowDown"].includes(event.key)) {
                    event.preventDefault();
                  }
                }}
                onChange={(event) => setQuery(event.target.value)}
              />
              <CloseButton
                aria-label={translate("Close options")}
                onClick={(event) => {
                  event.stopPropagation();
                  setOpen(false);
                }}
              >
                <CloseIcon />
              </CloseButton>
            </SearchRow>
            <ListWrapper
              style={{
                maxHeight: Math.max(
                  120,
                  Math.min(
                    300,
                    window.innerHeight -
                      (containerRef.current?.getBoundingClientRect().top ?? 0) -
                      50,
                  ),
                ),
              }}
            >
              <Options
                options={filteredOptions}
                value={value}
                focusIndex={focusIndex}
                showValues={showValues}
                showHints={showHints}
                recommendedValue={recommendedValue}
                onChange={onOptionClick}
              />
            </ListWrapper>
          </DropdownRollout>
        )}
      </PopUpPortal>
    </DropdownWrapper>
  );
};
