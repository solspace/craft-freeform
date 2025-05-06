import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useClickOutside } from '@ff-client/hooks/use-click-outside';
import translate from '@ff-client/utils/translations';
import type { Editor } from 'tinymce';

import { Category } from './components/category';
import { useFilteredSuggestions } from './operations/filter';
import { insertToken } from './operations/insert';
import { usePosition } from './operations/position';
import type { Suggestion } from './operations/suggestions';
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

  useEffect(() => {
    if (!editor) {
      return;
    }

    const keyDown = (event: KeyboardEvent): void | boolean => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          close();

          break;

        case 'Backspace':
          setFilter((prev) => (prev.length > 0 ? prev.slice(0, -1) : ''));

          break;

        case 'ArrowRight':
        case 'ArrowLeft':
          event.preventDefault();
          close();

          break;

        case 'ArrowDown':
          event.preventDefault();
          if (index < itemCountRef.current - 1) {
            setIndex((prev) =>
              prev < itemCountRef.current ? prev + 1 : itemCountRef.current - 1
            );
          }

          break;

        case 'ArrowUp':
          event.preventDefault();
          if (index > 0) {
            setIndex((prev) => (prev > 0 ? prev - 1 : 0));
          }

          break;

        case 'Enter':
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          if (index > -1) {
            const item = suggestions
              .flatMap((category) => category.items)
              .find((item) => item.active);

            if (item) {
              insert(item, filter);
            }
          }
          setFilter('');
          close();

          return false;

        default:
          if (event.key.length === 1) {
            setFilter((prev) => prev + event.key);
          }
          break;
      }
    };

    editor.on('keydown', keyDown, true);

    return () => {
      editor.off('keydown', keyDown);
    };
  }, [index, close, editor, suggestions]);

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
