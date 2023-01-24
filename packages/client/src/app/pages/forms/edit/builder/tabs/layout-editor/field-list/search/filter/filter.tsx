import React, { useState } from 'react';
import { useSpring } from 'react-spring';
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

  const style = useSpring({
    to: {
      opacity: active ? 1 : 0,
      scaleY: active ? 1 : 0,
    },
    config: {
      tension: 700,
    },
  });

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
        <DropDownWrapper style={style}>
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
