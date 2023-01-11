import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { set as setCells } from '@editor/store/slices/cells';
import { setPage } from '@editor/store/slices/context';
import { set as setFields } from '@editor/store/slices/fields';
import { update as updateForm } from '@editor/store/slices/form';
import { set as setLayouts } from '@editor/store/slices/layouts';
import { set as setPages } from '@editor/store/slices/pages';
import { set as setRows } from '@editor/store/slices/rows';
import {
  useQueryFormSettings,
  useQuerySingleForm,
} from '@ff-client/queries/forms';
import { v4 } from 'uuid';

import { Builder } from './builder/builder';
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
      dispatch(
        updateForm({
          id: null,
          uid: v4(),
          type: 'Solspace\\Freeform\\Form\\Types\\Regular',
          name: 'New Form',
          handle: 'newForm',
          settings: {},
        })
      );
      dispatch(setFields([]));
      dispatch(setPages([]));
      dispatch(setLayouts([]));
      dispatch(setRows([]));
      dispatch(setCells([]));

      dispatch(setPage(undefined));

      return;
    }

    if (!data) {
      return;
    }

    const {
      layout: { fields, pages, layouts, rows, cells },
    } = data;

    dispatch(updateForm(data));
    dispatch(setFields(fields));
    dispatch(setPages(pages));
    dispatch(setLayouts(layouts));
    dispatch(setRows(rows));
    dispatch(setCells(cells));

    dispatch(setPage(pages.find(Boolean)?.uid));
  }, [data, formId]);

  if (isFetching) {
    return <div>Fetching {formId}...</div>;
  }

  if (isError) {
    return <div>ERROR: {error.message as string}</div>;
  }

  return <Builder />;
};
