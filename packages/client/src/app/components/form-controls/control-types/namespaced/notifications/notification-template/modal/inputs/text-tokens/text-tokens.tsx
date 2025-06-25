import type { FC, FormEvent } from 'react';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ControlBlock } from '@components/form-controls/control.block';
import { useAppStore } from '@editor/store';
import type { Suggestion } from '@ff-client/types/notifications';

import type { InputControl } from '../../template.modal.types';
import { hide, show } from '../html-body/tokens/operations/dropdown';
import type { TokenBackend } from '../html-body/tokens/tokens.types';

import {
  AddButton,
  TextTokenContainer,
  TextTokenWrapper,
} from './text-tokens.styles';

export const TextTokens: FC<InputControl> = (props) => {
  const store = useAppStore();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastRangeRef = useRef<Range>(null);

  const { value, onChange } = props;

  const backend: TokenBackend = useMemo(
    () => ({
      getRange: () =>
        window.getSelection()?.getRangeAt(0) || document.createRange(),
      getRect: () => null,
      insert: (item: Suggestion): void => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
          return;
        }

        const range = lastRangeRef.current || selection.getRangeAt(0);
        if (range.startContainer.nodeType !== Node.TEXT_NODE) {
          return;
        }

        const textNode = range.startContainer as Text;
        const caretOffset = range.startOffset;
        const text = textNode.textContent ?? '';

        // Walk backwards from caret to find '@'
        let atIndex = -1;
        for (let i = caretOffset - 1; i >= 0; i--) {
          if (text[i] === '@') {
            atIndex = i;
            break;
          }
        }

        if (atIndex === -1) {
          return;
        }

        const tokenRange = document.createRange();
        tokenRange.setStart(textNode, atIndex);
        tokenRange.setEnd(textNode, caretOffset);

        // Replace "@filter" with token span
        const span = document.createElement('span');
        span.contentEditable = 'false';
        span.dataset.freeformToken = item.token;
        span.innerHTML = item.name;

        tokenRange.deleteContents();
        tokenRange.insertNode(span);

        // Move caret after the space
        const newRange = document.createRange();
        newRange.setStartAfter(span);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        // Update your state if needed
        onChange(wrapperRef.current?.innerHTML ?? '');
      },
      store,
      handlers: {
        on: {
          down: (callback) => {
            wrapperRef.current?.addEventListener('keydown', callback);
          },
          up: (callback) => {
            wrapperRef.current?.addEventListener('keyup', callback);
          },
        },
        off: {
          down: (callback) => {
            wrapperRef.current?.removeEventListener('keydown', callback);
          },
          up: (callback) => {
            wrapperRef.current?.removeEventListener('keyup', callback);
          },
        },
      },
    }),
    [store, onChange]
  );

  const buttonBackend: TokenBackend = {
    extrnalTrigger: true,
    getRange: () => {
      if (!lastRangeRef.current) {
        const range = document.createRange();
        range.selectNode(buttonRef.current);

        return range;
      }

      return lastRangeRef.current;
    },
    getRect: () => null,
    insert: (item: Suggestion): void => {
      const span = document.createElement('span');
      span.contentEditable = 'false';
      span.dataset.freeformToken = item.token;
      span.innerHTML = item.name;

      const range = lastRangeRef.current;
      // if no range is selected, we insert at the end of the text
      if (!range) {
        wrapperRef.current?.appendChild(span);
        onChange(wrapperRef.current.innerHTML);
        return;
      }

      if (
        range.startContainer.nodeType !== Node.TEXT_NODE &&
        range.startContainer.nodeType !== Node.ELEMENT_NODE
      ) {
        return;
      }

      const textNode = range.startContainer as Text;
      const caretOffset = range.startOffset;

      const tokenRange = document.createRange();
      tokenRange.setStart(textNode, caretOffset);
      tokenRange.setEnd(textNode, caretOffset);

      // Replace "@filter" with token span
      tokenRange.deleteContents();
      tokenRange.insertNode(span);

      // Move caret after the space
      const newRange = document.createRange();
      newRange.setStartAfter(span);
      newRange.collapse(true);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(newRange);

      // Update your state if needed
      onChange(wrapperRef.current?.innerHTML ?? '');
    },
    store,
    handlers: {
      on: {
        down: (callback) => {
          document?.addEventListener('keydown', callback);
        },
        up: (callback) => {
          document.addEventListener('keyup', callback);
        },
      },
      off: {
        down: (callback) => {
          document.removeEventListener('keydown', callback);
        },
        up: (callback) => {
          document.removeEventListener('keyup', callback);
        },
      },
    },
  };

  const saveRange = useCallback((): void => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      lastRangeRef.current = selection.getRangeAt(0).cloneRange();
    }
  }, []);

  const restoreRange = useCallback((): void => {
    const selection = window.getSelection();
    if (selection && lastRangeRef.current) {
      selection.removeAllRanges();
      selection.addRange(lastRangeRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      hide();
    };
  }, []);

  useEffect(() => {
    if (wrapperRef.current && wrapperRef.current.innerHTML !== value) {
      wrapperRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = useCallback(
    (event: FormEvent<HTMLDivElement>): void => {
      const nativeEvent = event.nativeEvent as InputEvent;
      const data = nativeEvent.data || '';

      if (data === '@') {
        show(backend);
      }

      if (wrapperRef.current) {
        onChange(wrapperRef.current.innerHTML);
      }
    },
    [backend, onChange]
  );

  return (
    <ControlBlock {...props}>
      <TextTokenWrapper>
        <TextTokenContainer
          className="text fullwidth"
          ref={wrapperRef}
          contentEditable
          onInput={handleInput}
          onBlur={saveRange}
          onKeyUp={saveRange}
          onMouseUp={saveRange}
          suppressContentEditableWarning
        />

        <AddButton
          ref={buttonRef}
          className="btn"
          onClick={(): void => {
            restoreRange();
            show(buttonBackend);
          }}
        >
          <i className="fa-solid fa-plus" />
        </AddButton>
      </TextTokenWrapper>
    </ControlBlock>
  );
};
