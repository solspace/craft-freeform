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
import { v4 } from 'uuid';

import { Builder } from './builder/builder';
import { cellActions } from './store/slices/layout/cells';
import { pageActions } from './store/slices/layout/pages';
import { rwoActions } from './store/slices/layout/rows';
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
        formActions.update({
          id: null,
          uid: v4(),
          type: 'Solspace\\Freeform\\Form\\Types\\Regular',
          name: 'New Form',
          handle: 'newForm',
          settings: {},
        })
      );
      dispatch(fieldActions.set([]));
      dispatch(pageActions.set([]));
      dispatch(layoutActions.set([]));
      dispatch(rwoActions.set([]));
      dispatch(cellActions.set([]));

      dispatch(contextActions.setPage(undefined));

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
    dispatch(rwoActions.set(rows));
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
