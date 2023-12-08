import React, { useEffect, useRef } from 'react';
import type { OptionCollection } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';

import CheckIcon from '../custom-dropdown/check.svg';
import {
  CheckMark,
  Item,
  Label,
  LabelContainer,
  List,
} from '../custom-dropdown/dropdown.options.styles';

import type { OptionPickerProps } from './option-picker';

type Props = Omit<OptionPickerProps, 'onChange'> & {
  value: string[];
  options: OptionCollection;
  focusIndex: number;
  query?: string;
  onChange: (value: string) => void;
};

export const Options: React.FC<Props> = ({
  value: selectedValues,
  options,
  query,
  focusIndex,
  onChange,
}) => {
  const optionRefs = useRef<HTMLLIElement[]>([]);

  useEffect(() => {
    if (optionRefs.current[focusIndex]) {
      optionRefs.current[focusIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [focusIndex]);

  if (!options.length) {
    return null;
  }

  return (
    <List>
      {options &&
        options.map((option, idx) => {
          let value: string;
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
              onClick={(event) => {
                event.stopPropagation();
                if (value !== undefined && onChange) {
                  onChange(value);
                }
              }}
              key={idx}
              className={classes(
                children !== undefined && 'has-children',
                selectedValues.includes(value) && 'selected',
                value === '' && 'empty',
                shadowIndex === focusIndex && 'focused'
              )}
            >
              <Label
                className={classes(children !== undefined && 'has-children')}
              >
                {!children && selectedValues.includes(value) && (
                  <CheckMark>
                    <CheckIcon />
                  </CheckMark>
                )}
                <LabelContainer>
                  {option.icon && option.icon}
                  {option.label}
                </LabelContainer>
              </Label>

              {children && (
                <Options
                  options={children}
                  value={selectedValues}
                  query={query}
                  focusIndex={focusIndex}
                  onChange={onChange}
                />
              )}
            </Item>
          );
        })}
    </List>
  );
};
