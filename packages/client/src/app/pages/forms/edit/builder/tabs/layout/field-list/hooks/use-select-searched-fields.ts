import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Search } from '@editor/store/slices/search';
import { searchSelectors } from '@editor/store/slices/search/search.selectors';
import type {
  FieldFavorite,
  FieldForm,
  FieldType,
} from '@ff-client/types/fields';
// import type { Group, GroupData, GroupItem } from '@ff-client/types/groups';

type SelectSearchedFields<T> = () => (data: T[]) => T[];

export const useSelectSearchedFields: SelectSearchedFields<FieldType> = () => {
  const searchQuery = useSelector(searchSelectors.query(Search.Fields));

  return useCallback(
    (data: FieldType[]) => {
      if (!searchQuery) {
        return data;
      }

      return data.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    },
    [searchQuery]
  );
};

export const useSelectSearchedFavorites: SelectSearchedFields<
  FieldFavorite
> = () => {
  const searchQuery = useSelector(searchSelectors.query(Search.Fields));

  return useCallback(
    (data: FieldFavorite[]) => {
      if (!searchQuery) {
        return data;
      }

      return data.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    },
    [searchQuery]
  );
};

export const useSelectSearchedForms: SelectSearchedFields<FieldForm> = () => {
  const searchQuery = useSelector(searchSelectors.query(Search.Fields));

  return useCallback(
    (data: FieldForm[]): FieldForm[] => {
      if (!searchQuery) {
        return data;
      }

      return data
        .map(
          (form) =>
            ({
              ...form,
              fields: form.fields.filter((field) =>
                field.label.toLowerCase().includes(searchQuery.toLowerCase())
              ),
            }) as FieldForm
        )
        .filter((form) => form.fields.length > 0);
    },
    [searchQuery]
  );
};

// export const useSelectSearchedGroups: SelectSearchedFields<Group> = () => {
//   const searchQuery = useSelector(searchSelectors.query(Search.Fields));

//   return useCallback(
//     (data: Group): GroupItem => {
//       if (!searchQuery) {
//         const unassignedTypes = data?.types
//           .map((_, index) => index)
//           .filter(
//             (index) =>
//               !data.groups?.hidden?.includes(index) &&
//               !data.groups?.grouped?.some((group) => group.types.includes(index))
//           );

//         return {
//           grouped: data.groups?.grouped || [],
//           unassigned: unassignedTypes || [],
//         };
//       }

//       const filteredGrouped = data.groups?.grouped
//         .map((group) => ({
//           ...group,
//           types: group.types.filter(
//             (item) =>
//               data.types?.[item].toLowerCase().includes(searchQuery.toLowerCase())
//           ),
//         }))
//         .filter((group) => group.types.length > 0);

//       const unassignedTypes = data.types
//         .map((_, index) => index)
//         .filter(
//           (index) =>
//             !data.groups?.hidden?.includes(index) &&
//             !filteredGrouped.some((group) => group.types.includes(index))
//         );

//       return {
//         grouped: filteredGrouped || [],
//         unassigned: unassignedTypes || [],
//       };
//     },
//     [searchQuery]
//   );
// };
