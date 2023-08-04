import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useClickOutside } from '@ff-client/hooks/use-click-outside';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import type { OptionCollection } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';

import {
  findLabelByValue,
  findValueByShadowIndex,
  useFilteredOptions,
} from './dropdown.operations';
import { Options } from './dropdown.options';
import {
  CurrentValue,
  DropdownRollout,
  DropdownWrapper,
  ListWrapper,
  Search,
} from './dropdown.styles';

export type DropdownProps = {
  emptyOption?: string;
  options?: OptionCollection;
  value?: string;
  onChange?: (value: string) => void;
};

export const Dropdown: React.FC<DropdownProps> = ({
  emptyOption,
  value,
  options,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focusIndex, setFocusIndex] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);
  const containerRef = useClickOutside<HTMLDivElement>(
    () => setOpen(false),
    open
  );

  const [filteredOptions, optionCount] = useFilteredOptions(
    options,
    query,
    emptyOption
  );

  const selectedValue = useMemo(
    () => findLabelByValue(options, value) || emptyOption,
    [options, value]
  );

  useOnKeypress(
    {
      meetsCondition: open,
      type: 'keydown',
      callback: (event) => {
        if (event.key === 'ArrowDown' && focusIndex < optionCount - 1) {
          setFocusIndex((prev) => prev + 1);
        }

        if (event.key === 'ArrowUp' && focusIndex > 0) {
          setFocusIndex((prev) => prev - 1);
        }
      },
    },
    [focusIndex, optionCount]
  );

  useOnKeypress(
    {
      meetsCondition: open,
      type: 'keyup',
      callback: (event) => {
        if (event.key === 'Enter') {
          const value = findValueByShadowIndex(filteredOptions, focusIndex);
          onChange && onChange(value);
          setOpen(false);
        }
      },
    },
    [filteredOptions, focusIndex]
  );

  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
      setFocusIndex(0);
    } else {
      setQuery('');
    }
  }, [open, query]);

  const onOptionClick = useCallback(
    (value: string) => {
      onChange && onChange(value);
      setOpen(false);
    },
    [onChange]
  );

  return (
    <DropdownWrapper
      ref={containerRef}
      className={classes(open && 'open')}
      onClick={() => setOpen(!open)}
    >
      <CurrentValue>{selectedValue}</CurrentValue>
      <DropdownRollout>
        <Search
          placeholder="Search..."
          ref={searchRef}
          value={query}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.preventDefault();
              setOpen(false);
            }

            if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
              event.preventDefault();
            }
          }}
          onChange={(event) => setQuery(event.target.value)}
        />
        <ListWrapper>
          <Options
            options={filteredOptions}
            value={value}
            focusIndex={focusIndex}
            onChange={onOptionClick}
          />
        </ListWrapper>
      </DropdownRollout>
    </DropdownWrapper>
  );
};
