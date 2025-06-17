import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useClickOutside } from '@ff-client/hooks/use-click-outside';
import type { Suggestion } from '@ff-client/types/notifications';
import translate from '@ff-client/utils/translations';
import type { Editor } from 'tinymce';

import { Category } from './components/category';
import { useArrowNavigation } from './listeners/use-arrows';
import { useKeyboard } from './listeners/use-keyboard';
import { useFilteredSuggestions } from './operations/filter';
import { insertToken } from './operations/insert';
import { usePosition } from './operations/position';
import { Body, Title, TokenDropdownWrapper } from './tokens.dropdown.styles';

export type Position = {
  left: number;
  top: number;
};

export type TokenAPI = {
  close: () => void;
  updatePosition: (position: Position) => void;
};

type Props = {
  editor: Editor;
  position?: Position;
  close?: () => void;
  insert: (item: Suggestion, filter: string) => void;
};

const TokenDropdown: React.FC<Props> = ({ editor, insert, close }) => {
  const ref = useRef<HTMLDivElement>(null);
  const itemCountRef = useRef<number>(0);

  const [index, setIndex] = useState(0);
  const { suggestions, filter, setFilter } = useFilteredSuggestions(
    editor,
    index
  );

  usePosition(editor, ref);

  useEffect(() => {
    itemCountRef.current = suggestions.reduce(
      (acc, category) => acc + category.items.length,
      0
    );
  }, [suggestions]);

  useClickOutside({ isEnabled: true, callback: close, refObject: ref });
  useKeyboard({ editor, setFilter, close });
  useArrowNavigation({
    editor,
    index,
    filter,
    setIndex,
    setFilter,
    itemCountRef,
    suggestions,
    insert,
    close,
  });

  const onInsert = useCallback(
    (item: Suggestion) => {
      insert(item, filter);
      setFilter('');
      close();
    },
    [filter, insert, close]
  );

  return (
    <TokenDropdownWrapper ref={ref}>
      <Title>{translate('Freeform Template Tokens')}</Title>
      <Body>
        {suggestions.map((category) => (
          <Category
            key={category.name}
            category={category}
            onClick={onInsert}
          />
        ))}
      </Body>
    </TokenDropdownWrapper>
  );
};

export const renderTokenDropdown = (editor: Editor): TokenAPI => {
  const container = document.createElement('div');
  container.className = 'freeform-tokens-dropdown';
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  const insert = insertToken(editor);

  const close = (): void => {
    root.unmount();
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  };

  root.render(<TokenDropdown editor={editor} close={close} insert={insert} />);

  return {
    close,
    updatePosition: (position) => {
      root.render(
        <TokenDropdown
          editor={editor}
          close={close}
          position={position}
          insert={insert}
        />
      );
    },
  };
};
