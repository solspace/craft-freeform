import type { UseQueryResult } from 'react-query';
import { useQuery } from 'react-query';
import { useAppDispatch } from '@editor/store';
import { set as setCells } from '@editor/store/slices/cells';
import { setPage } from '@editor/store/slices/context';
import { set as setFields } from '@editor/store/slices/fields';
import { update as updateForm } from '@editor/store/slices/form';
import { set as setLayouts } from '@editor/store/slices/layouts';
import { set as setPages } from '@editor/store/slices/pages';
import { set as setRows } from '@editor/store/slices/rows';
import type {
  EditableProperty,
  ExtendedFormType,
  Form,
} from '@ff-client/types/forms';
import type { AxiosError } from 'axios';
import axios from 'axios';

export const useQueryForms = (): UseQueryResult<Form[], AxiosError> => {
  return useQuery<Form[], AxiosError>('forms', () =>
    axios.get<Form[]>('/client/api/forms').then((res) => res.data)
  );
};

export const useQuerySingleForm = (
  id?: number
): UseQueryResult<ExtendedFormType, AxiosError> => {
  const dispatch = useAppDispatch();

  return useQuery<ExtendedFormType, AxiosError>(
    ['forms', id],
    () =>
      axios
        .get<ExtendedFormType>(`/client/api/forms/${id}`)
        .then((res) => res.data),
    {
      staleTime: Infinity,
      enabled: !!id,
      onSuccess: (form) => {
        const {
          layout: { fields, pages, layouts, rows, cells },
        } = form;

        dispatch(updateForm(form));
        dispatch(setFields(fields));
        dispatch(setPages(pages));
        dispatch(setLayouts(layouts));
        dispatch(setRows(rows));
        dispatch(setCells(cells));

        dispatch(setPage(pages.find(Boolean)?.uid));
      },
    }
  );
};

export const useQueryEditableProperties = (): UseQueryResult<
  EditableProperty[],
  AxiosError
> => {
  return useQuery<EditableProperty[], AxiosError>(
    ['forms', 'editable-properties'],
    () =>
      axios
        .get<EditableProperty[]>(`/client/api/forms/editable-properties`)
        .then((res) => res.data)
  );
};
