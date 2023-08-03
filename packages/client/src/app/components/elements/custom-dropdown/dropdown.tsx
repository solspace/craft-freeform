import React, { useEffect, useRef, useState } from 'react';
import { useClickOutside } from '@ff-client/hooks/use-click-outside';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';
import type { OptionCollection } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';

import { useFilteredOptions } from './dropdown.operations';
import { Options } from './dropdown.options';
import {
  CurrentValue,
  DropdownRollout,
  DropdownWrapper,
  ListWrapper,
  Search,
} from './dropdown.styles';

export type DropdownProps = {
  options?: OptionCollection;
  selectedValue?: string;
};

export const Dropdown: React.FC<DropdownProps> = ({
  selectedValue,
  options,
}) => {
  const [open, setOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [focusIndex, setFocusIndex] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);

  const [filteredOptions, optionCount] = useFilteredOptions(options, query);

  const containerRef = useClickOutside<HTMLDivElement>(
    () => setOpen(false),
    open
  );

  useOnKeypress(
    {
      meetsCondition: open,
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

  useEffect(() => {
    if (open) {
      searchRef.current?.focus();
      setFocusIndex(0);
    } else {
      setQuery('');
    }
  }, [open, query]);

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
            selectedValue={selectedValue}
            focusIndex={focusIndex}
          />
        </ListWrapper>
      </DropdownRollout>
    </DropdownWrapper>
  );
};
