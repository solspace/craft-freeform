import React from 'react';
import { ErrorBlock } from '@components/notification-blocks/error/error-block';
import config, { Edition } from '@config/freeform/freeform.config';
import { useFetchFieldTypes } from '@ff-client/queries/field-types';
import { useFetchGroups } from '@ff-client/queries/groups';
import translate from '@ff-client/utils/translations';
import EditIcon from '@ff-icons/actions/edit.icon.svg';

import { FieldGroup } from '../../field-group/field-group';
import { LoaderFieldGroup } from '../../field-group/field-group.loader';
import { List } from '../../field-group/field-group.styles';
import { useSelectSearchedGroups } from '../../hooks/use-select-searched-fields';

import { useCreateModal } from './modal/use-create-modal';
import { GroupName, GroupWrapper } from './base-fields.styles';
import { FieldItem } from './field-item';

const title = translate('Field Types');

export const BaseFields: React.FC = () => {
  const select = useSelectSearchedGroups();
  const {
    data: groupsData,
    isFetching: groupsFetching,
    isError: groupsIsError,
    error: groupsError,
  } = useFetchGroups({ select });
  const {
    data: fieldTypesData,
    isFetching: fieldTypesFetching,
    isError: fieldTypesIsError,
    error: fieldTypesError,
  } = useFetchFieldTypes();
  const openModal = useCreateModal();

  const loading = groupsFetching || fieldTypesFetching;
  const hasError = groupsIsError || fieldTypesIsError;

  if (loading && (!groupsData || !fieldTypesData)) {
    return <LoaderFieldGroup words={[50, 70]} items={16} />;
  }

  if (hasError) {
    return (
      <ErrorBlock>{groupsError.message || fieldTypesError.message}</ErrorBlock>
    );
  }

  const getFieldItem = (type: string): React.ReactNode | null => {
    const fieldType = fieldTypesData.find((item) => item.typeClass === type);
    return fieldType && <FieldItem key={type} fieldType={fieldType} />;
  };

  return (
    <FieldGroup
      button={{
        icon: <EditIcon />,
        title: translate('Edit Manager'),
        onClick: openModal,
      }}
      editionIsPro={config.editions.is(Edition.Pro)}
      title={title}
    >
      {groupsData.groups.grouped?.map((group) => (
        <GroupWrapper key={group.uid} color={group.color}>
          {group.types.length > 0 && (
            <>
              {group.label && <GroupName>{group.label}</GroupName>}
              <List>{group.types.map((type) => getFieldItem(type))}</List>
            </>
          )}
        </GroupWrapper>
      ))}

      {groupsData?.types && (
        <List>{groupsData?.types.map((type) => getFieldItem(type))}</List>
      )}
    </FieldGroup>
  );
};
