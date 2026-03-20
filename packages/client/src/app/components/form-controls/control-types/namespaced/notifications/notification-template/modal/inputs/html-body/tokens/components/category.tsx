import type {
  Suggestion,
  SuggestionCategory,
} from "@ff-client/types/notifications";
import type React from "react";

import { CategoryWrapper, Label } from "./category.styles";
import { Item } from "./item";

type Props = {
  category: SuggestionCategory;
  currentItem?: string;
  filter?: string;
  onClick?: (item: Suggestion) => void;
};

export const Category: React.FC<Props> = ({ category, onClick }) => {
  return (
    <CategoryWrapper>
      <Label>{category.name}</Label>
      <div>
        {category.items.map((item) => (
          <Item key={item.token} item={item} onClick={onClick} />
        ))}
      </div>
    </CategoryWrapper>
  );
};
