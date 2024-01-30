import React from 'react';
import { Provider } from 'react-redux';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import { ModalProvider } from '@components/modals/modal.context';

import { Edit } from './edit';
import { EditorGlobalStyles } from './edit.styles';
import { store } from './store';

export const EditProvider: React.FC = () => {
  return (
    <Provider store={store}>
      <Breadcrumb id="form-editor" label="Forms" url="/forms" />
      <EditorGlobalStyles />

      <ModalProvider>
        <Edit />
      </ModalProvider>
    </Provider>
  );
};
