import React from 'react';
import { Provider } from 'react-redux';

import { Edit } from './edit';
import { EditorGlobalStyles } from './edit.styles';
import { store } from './store';

export const EditProvider: React.FC = () => {
  return (
    <Provider store={store}>
      <EditorGlobalStyles />
      <Edit />
    </Provider>
  );
};
