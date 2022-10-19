import React from 'react';
import { useSelector } from 'react-redux';

import { Sidebar as SidebarWrapper } from '@ff-client/app/components/layout/sidebar/sidebar';

import { selectFocus } from '../../../../store/slices/context';
import { ErrorBoundary } from './boundaries/ErrorBoundary';
import { FieldProperties } from './field/field-properties';

export const PropertyEditor: React.FC = () => {
  const { type, uid } = useSelector(selectFocus);

  const component = <FieldProperties uid={uid} />;

  return (
    <SidebarWrapper>
      <ErrorBoundary
        message={`Could not load property editor for ${type} type`}
      >
        {component}
      </ErrorBoundary>
    </SidebarWrapper>
  );
};
