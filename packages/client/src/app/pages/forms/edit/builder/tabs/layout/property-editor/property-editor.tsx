import React from 'react';
import { useSelector } from 'react-redux';
import { useTransition } from 'react-spring';
import { ErrorBoundary } from '@components/form-controls/boundaries/ErrorBoundary';
import { RenderContextProvider } from '@components/form-controls/context/render.context';
import { useAppDispatch } from '@editor/store';
import { contextActions } from '@editor/store/slices/context';
import { contextSelectors } from '@editor/store/slices/context/context.selectors';
import { useOnKeypress } from '@ff-client/hooks/use-on-keypress';

import { FieldProperties } from './editors/fields/field-properties';
import { PageProperties } from './editors/pages/page-properties';
import { AnimatedBlock, PropertyEditorWrapper } from './property-editor.styles';

export const PropertyEditor: React.FC = () => {
  const dispatch = useAppDispatch();

  const context = useSelector(contextSelectors.focus);
  const { active, type } = context;

  useOnKeypress({
    meetsCondition: active,
    callback: (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        dispatch(contextActions.unfocus());
      }
    },
  });

  const transitions = useTransition(active ? [context] : null, {
    from: { transform: 'translate3d(-100%, 0, 0)', opacity: 1 },
    enter: { transform: 'translate3d(0%, 0, 0)', opacity: 1, zIndex: 2 },
    leave: { transform: 'translate3d(100%, 0, 0)' },
    config: {
      tension: 500,
    },
  });

  return (
    <RenderContextProvider size="small">
      <PropertyEditorWrapper $active={active}>
        <ErrorBoundary
          message={`Could not load property editor for "${type}" type`}
        >
          {transitions((style, item) => (
            <AnimatedBlock style={style}>
              {!!item && item.type === 'field' && (
                <FieldProperties uid={item.uid} />
              )}
              {!!item && item.type === 'page' && (
                <PageProperties uid={item.uid} />
              )}
            </AnimatedBlock>
          ))}
        </ErrorBoundary>
      </PropertyEditorWrapper>
    </RenderContextProvider>
  );
};
