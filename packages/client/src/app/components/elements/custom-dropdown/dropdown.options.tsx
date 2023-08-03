import React, { useEffect, useRef } from 'react';
import classes from '@ff-client/utils/classes';

import type { DropdownProps } from './dropdown';
import { Item, Label, List } from './dropdown.options.styles';

type Props = DropdownProps & {
  focusIndex: number;
  query?: string;
};

export const Options: React.FC<Props> = ({
  selectedValue,
  options,
  query,
  focusIndex,
}) => {
  const optionRefs = useRef<HTMLLIElement[]>([]);

  useEffect(() => {
    if (optionRefs.current[focusIndex]) {
      optionRefs.current[focusIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [focusIndex]);

  return (
    <List>
      {options &&
        options.map((option, idx) => {
          let value: string | number;
          let shadowIndex: number;
          if ('value' in option) {
            value = option.value;
            shadowIndex = option.shadowIndex;
          }

          let children;
          if ('children' in option) {
            children = option.children;
          }

          return (
            <Item
              ref={(el) => {
                if (shadowIndex !== undefined) {
                  optionRefs.current[shadowIndex] = el;
                }
              }}
              key={idx}
              className={classes(
                children !== undefined && 'has-children',
                value === selectedValue && 'selected',
                shadowIndex === focusIndex && 'focused'
              )}
            >
              <Label>{option.label}</Label>
              {children && (
                <Options
                  options={children}
                  selectedValue={selectedValue}
                  query={query}
                  focusIndex={focusIndex}
                />
              )}
            </Item>
          );
        })}
    </List>
  );
};
