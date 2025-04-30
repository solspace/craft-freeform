import React from 'react';

import type { SuggestionCategory } from '../operations/suggestions';

import { CategoryWrapper, Label } from './category.styles';
import { Item } from './item';

type Props = {
  category: SuggestionCategory;
  currentItem?: string;
  filter?: string;
  onClick?: (item: string) => void;
};

export const Category: React.FC<Props> = ({ category }) => {
  return (
    <CategoryWrapper>
      <Label>{category.name}</Label>
      <div>
        {category.items.map((item) => (
          <Item key={item.value} item={item} />
        ))}
      </div>
    </CategoryWrapper>
  );
};
