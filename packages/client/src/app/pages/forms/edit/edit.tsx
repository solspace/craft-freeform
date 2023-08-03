import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { contextActions } from '@editor/store/slices/context';
import { formActions } from '@editor/store/slices/form';
import { fieldActions } from '@editor/store/slices/layout/fields';
import { layoutActions } from '@editor/store/slices/layout/layouts';
import {
  useQueryFormSettings,
  useQuerySingleForm,
} from '@ff-client/queries/forms';

import { Builder } from './builder/builder';
import { LoaderBuilder } from './builder/builder.loader';
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
      return;
    }

    if (!data) {
      return;
    }

    const {
      layout: { fields, pages, layouts, rows },
    } = data;

    dispatch(formActions.update(data));
    dispatch(fieldActions.set(fields));
    dispatch(pageActions.set(pages));
    dispatch(layoutActions.set(layouts));
    dispatch(rowActions.set(rows));

    if (pages.length === 0) {
      dispatch(addNewPage());
    } else {
      dispatch(contextActions.setPage(pages.find(Boolean)?.uid));
    }
  }, [data, formId]);

  if (isFetching) {
    return <LoaderBuilder />;
  }

  if (isError) {
    return <div>ERROR: {error.message as string}</div>;
  }

  return <Builder />;
};
