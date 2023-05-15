import React from 'react';
import { useSelector } from 'react-redux';
import { ErrorBoundary } from '@components/form-controls/boundaries/ErrorBoundary';
import { RenderContextProvider } from '@components/form-controls/context/render.context';
import { useAppDispatch } from '@editor/store';
import { contextActions } from '@editor/store/slices/context';
import { contextSelectors } from '@editor/store/slices/context/context.selectors';
import { fieldSelectors } from '@editor/store/slices/fields/fields.selectors';
import CloseIcon from '@ff-client/assets/icons/circle-xmark-solid.svg';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';

import { FavoriteButton } from './favorite/favorite.button';
import { FieldProperties } from './field-properties';
import { CloseLink, PropertyEditorWrapper } from './property-editor.styles';

export const PropertyEditor: React.FC = () => {
  const { active, type, uid } = useSelector(contextSelectors.focus);
  const field = useSelector(fieldSelectors.one(uid));

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
        <FavoriteButton field={field} />
        <ErrorBoundary
          message={`Could not load property editor for "${type}" type`}
        >
          <FieldProperties uid={uid} />
        </ErrorBoundary>
      </PropertyEditorWrapper>
    </RenderContextProvider>
  );
};
