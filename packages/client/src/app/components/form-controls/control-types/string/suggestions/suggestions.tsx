import type { FC, MutableRefObject } from 'react';
import React from 'react';

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

type Suggestion = {
  name: string;
  hint: string;
};

export type SuggestionCategory = {
  label: string;
  data: Suggestion[];
};

type Props = {
  inputRef?: MutableRefObject<HTMLInputElement>;
  filter?: string;
  suggestions: SuggestionCategory[];
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
