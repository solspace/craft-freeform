import type { PropsWithChildren, ReactElement } from 'react';
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import React from 'react';
import { PopUpPortal } from '@components/elements/pop-up-portal';
import { useEscapeStack } from '@ff-client/contexts/escape/escape.context';
import { useClickOutside } from '@ff-client/hooks/use-click-outside';
import classes from '@ff-client/utils/classes';

import { useEditorAnimations } from './previewable-component.animations';
import {
  EditableContentWrapper,
  PreviewContainer,
  PreviewWrapper,
} from './previewable-component.styles';

type Props = {
  preview: ReactElement;
  onEdit?: () => void;
  onAfterEdit?: () => void;
};

export const PreviewableComponent: React.FC<PropsWithChildren<Props>> = ({
  preview,
  onEdit,
  onAfterEdit,
  children,
}) => {
  const [isEditing, setIsEditing] = useState(undefined);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const { editorAnimation } = useEditorAnimations({
    wrapper: wrapperRef.current,
    editor: editorRef.current,
    isEditing,
  });

  useClickOutside<HTMLDivElement>({
    callback: () => {
      setIsEditing(false);
    },
    isEnabled: isEditing,
    refObject: editorRef,
    excludeClassNames: ['tagify__dropdown', 'dropdown-rollout'],
  });

  useEscapeStack(() => setIsEditing(false), !!isEditing);

  // Call after-edit callbacks when the editor is being closed
  useEffect(() => {
    if (isEditing === false) {
      onAfterEdit && onAfterEdit();
    }
  }, [isEditing]);

  return (
    <PreviewWrapper ref={wrapperRef}>
      <PopUpPortal>
        <EditableContentWrapper
          style={{
            pointerEvents: isEditing ? 'initial' : 'none',
            ...editorAnimation,
          }}
          className={classes(isEditing && 'active', 'editable-content')}
          ref={editorRef}
        >
          {children}
        </EditableContentWrapper>
      </PopUpPortal>

      <PreviewContainer
        onClick={() => {
          setIsEditing(true);
          onEdit && onEdit();
        }}
      >
        {preview}
      </PreviewContainer>
    </PreviewWrapper>
  );
};
