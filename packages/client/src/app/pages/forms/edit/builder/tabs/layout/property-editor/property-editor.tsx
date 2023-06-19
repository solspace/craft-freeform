import React from 'react';
import { useSelector } from 'react-redux';
import { ErrorBoundary } from '@components/form-controls/boundaries/ErrorBoundary';
import { RenderContextProvider } from '@components/form-controls/context/render.context';
import { useAppDispatch } from '@editor/store';
import { contextActions } from '@editor/store/slices/context';
import { contextSelectors } from '@editor/store/slices/context/context.selectors';
import CloseIcon from '@ff-client/assets/icons/circle-xmark-solid.svg';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';

import { FieldProperties } from './editors/fields/field-properties';
import { PageProperties } from './editors/pages/page-properties';
import { CloseLink, PropertyEditorWrapper } from './property-editor.styles';

export const PropertyEditor: React.FC = () => {
  const { active, type, uid } = useSelector(contextSelectors.focus);

  let editor: React.ReactElement = null;
  switch (type) {
    case 'field':
      editor = <FieldProperties uid={uid} />;
      break;

    case 'page':
      editor = <PageProperties />;
      break;
  }

  const dispatch = useAppDispatch();

  useOnKeypress({
    meetsCondition: active,
    callback: (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        dispatch(contextActions.unfocus());
      }
    },
  });

  return (
    <RenderContextProvider size="small">
      <PropertyEditorWrapper>
        <CloseLink onClick={() => dispatch(contextActions.unfocus())}>
          <CloseIcon />
        </CloseLink>
        <ErrorBoundary
          message={`Could not load property editor for "${type}" type`}
        >
          {editor}
        </ErrorBoundary>
      </PropertyEditorWrapper>
    </RenderContextProvider>
  );
};
