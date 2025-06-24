import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useClickOutside } from '@ff-client/hooks/use-click-outside';
import type { Suggestion } from '@ff-client/types/notifications';
import translate from '@ff-client/utils/translations';

import { Category } from './components/category';
import { useArrowNavigation } from './listeners/use-arrows';
import { useKeyboard } from './listeners/use-keyboard';
import { useFilteredSuggestions } from './operations/filter';
import { usePosition } from './operations/position';
import { Body, Title, TokenDropdownWrapper } from './tokens.dropdown.styles';
import type { TokenBackend } from './tokens.types';

export type Position = {
  left: number;
  top: number;
};

export type TokenAPI = {
  close: () => void;
};

type Props = {
  backend: TokenBackend;
  position?: Position;
  close?: () => void;
};

const TokenDropdown: React.FC<Props> = ({ backend, close }) => {
  const ref = useRef<HTMLDivElement>(null);
  const itemCountRef = useRef<number>(0);

  const [index, setIndex] = useState(0);
  const { suggestions, filter, setFilter } = useFilteredSuggestions(
    backend,
    index
  );

  usePosition(backend, ref);

  useEffect(() => {
    itemCountRef.current = suggestions.reduce(
      (acc, category) => acc + category.items.length,
      0
    );
  }, [suggestions]);

  useClickOutside({ isEnabled: true, callback: close, refObject: ref });
  useKeyboard({ backend, setFilter, close });
  useArrowNavigation({
    backend,
    index,
    filter,
    setIndex,
    setFilter,
    itemCountRef,
    suggestions,
    close,
  });

  const onInsert = useCallback(
    (item: Suggestion) => {
      backend.insert(item, filter);
      setFilter('');
      close();
    },
    [filter, backend.insert, close]
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

export const renderTokenDropdown = (backend: TokenBackend): TokenAPI => {
  const container = document.createElement('div');
  container.className = 'freeform-tokens-dropdown';
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);

  const close = (): void => {
    root.unmount();
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  };

  root.render(<TokenDropdown backend={backend} close={close} />);

  return { close };
};
