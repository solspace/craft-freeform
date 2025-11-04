import type { FC, MutableRefObject } from 'react';
import React from 'react';
import type { EnvironmentSuggestionCategories } from '@ff-client/queries/autosuggest';

import { useFilteredSuggestions } from './suggestions.filter';
import { useFocusTracking } from './suggestions.hooks';
import {
  Dash,
  Hint,
  Item,
  ItemList,
  ItemName,
  SuggestionCategory,
  SuggestionsWrapper,
  Title,
} from './suggestions.styles';

type Props = {
  inputRef?: MutableRefObject<HTMLInputElement>;
  filter?: string;
  suggestions: EnvironmentSuggestionCategories;
  update: (value: string) => void;
};

export const Suggestions: FC<Props> = ({
  inputRef,
  filter,
  suggestions,
  update,
}) => {
  const active = useFocusTracking(inputRef);
  const filtered = useFilteredSuggestions(suggestions, filter);

  if (!filtered.length || !active) {
    return null;
  }

  return (
    <SuggestionsWrapper>
      {filtered.map((category) => (
        <SuggestionCategory key={category.label}>
          <Title>{category.label}</Title>
          <ItemList>
            {category.data.map(({ name, hint }) => (
              <Item key={name} onClick={() => update(name)}>
                <ItemName>{name}</ItemName>
                {!!hint && (
                  <>
                    <Dash />
                    <Hint>{hint}</Hint>
                  </>
                )}
              </Item>
            ))}
          </ItemList>
        </SuggestionCategory>
      ))}
    </SuggestionsWrapper>
  );
};
