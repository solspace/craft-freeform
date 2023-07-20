import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { contextActions } from '@editor/store/slices/context';
import { fieldActions } from '@editor/store/slices/fields';
import { formActions } from '@editor/store/slices/form';
import { layoutActions } from '@editor/store/slices/layout/layouts';
import {
  useQueryFormSettings,
  useQuerySingleForm,
} from '@ff-client/queries/forms';
import camelCase from 'lodash.camelcase';
import { adjectives, uniqueNamesGenerator } from 'unique-names-generator';
import { colors } from 'unique-names-generator';
import { v4 } from 'uuid';

import { Builder } from './builder/builder';
import { cellActions } from './store/slices/layout/cells';
import { pageActions } from './store/slices/layout/pages';
import { rowActions } from './store/slices/layout/rows';
import { addNewPage } from './store/thunks/pages';
import { useAppDispatch } from './store';

type RouteParams = {
  formId: string;
};

export const Edit: React.FC = () => {
  const { formId } = useParams<RouteParams>();
  const dispatch = useAppDispatch();

  useQueryFormSettings();

  const { data, isFetching, isError, error } = useQuerySingleForm(
    formId && Number(formId)
  );

  useEffect(() => {
    if (formId === undefined) {
      const formName = uniqueNamesGenerator({
        dictionaries: [colors, adjectives, ['form']],
        separator: ' ',
        style: 'capital',
      });

      dispatch(
        formActions.update({
          id: null,
          uid: v4(),
          type: 'Solspace\\Freeform\\Form\\Types\\Regular',
          name: formName,
          handle: camelCase(formName),
          settings: {},
        })
      );
      dispatch(fieldActions.set([]));
      dispatch(pageActions.set([]));
      dispatch(layoutActions.set([]));
      dispatch(rowActions.set([]));
      dispatch(cellActions.set([]));

      dispatch(addNewPage());

      return;
    }

    if (!data) {
      return;
    }

    const {
      layout: { fields, pages, layouts, rows, cells },
    } = data;

    dispatch(formActions.update(data));
    dispatch(fieldActions.set(fields));
    dispatch(pageActions.set(pages));
    dispatch(layoutActions.set(layouts));
    dispatch(rowActions.set(rows));
    dispatch(cellActions.set(cells));

    dispatch(contextActions.setPage(pages.find(Boolean)?.uid));
  }, [data, formId]);

  if (isFetching) {
    return <div>Fetching {formId}...</div>;
  }

  if (isError) {
    return <div>ERROR: {error.message as string}</div>;
  }

  return <Builder />;
};
