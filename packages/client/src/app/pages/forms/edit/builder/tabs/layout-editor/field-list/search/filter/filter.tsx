import React, { useState } from 'react';
import { useClickOutside } from '@ff-client/hooks/use-click-outside';
import translate from '@ff-client/utils/translations';

import FilterIconSVG from '../sliders.svg';

import {
  DropDownWrapper,
  FilterIcon,
  Heading,
  Item,
  ItemCheckbox,
} from './filter.styles';

const list = [
  'Favorites',
  'Standard Fields',
  'Form 1 fields',
  'Form 2 fields',
  'Form 3 fields',
];

export const Filter: React.FC = () => {
  const [active, setActive] = useState(false);
  const ref = useClickOutside<HTMLButtonElement>(() => {
    setActive(false);
  }, active);

  return (
    <>
      <FilterIcon
        ref={ref}
        className={active && 'active'}
        onClick={(event): void => {
          if (active && event.target === ref.current) {
            setActive(false);
          }

          if (!active) {
            setActive(true);
          }
        }}
      >
        <FilterIconSVG />
        <DropDownWrapper>
          <Heading>{translate('Search in')}</Heading>
          <ul>
            {list.map((item) => (
              <Item key={item}>
                <ItemCheckbox />
                {item}
              </Item>
            ))}
          </ul>
        </DropDownWrapper>
      </FilterIcon>
    </>
  );
};
