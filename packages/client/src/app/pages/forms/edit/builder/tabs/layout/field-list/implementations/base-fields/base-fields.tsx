import React from 'react';
import { ErrorBlock } from '@components/notification-blocks/error/error-block';
import config, { Edition } from '@config/freeform/freeform.config';
import { useFieldTypeSearch } from '@ff-client/queries/field-types';
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
  const { data, isFetching, isError, error } = useFetchGroups({ select });
  const openModal = useCreateModal();
  const findType = useFieldTypeSearch();

  if (!data && isFetching) {
    return <LoaderFieldGroup words={[50, 70]} items={16} />;
  }

  if (isError) {
    return <ErrorBlock>{error.message}</ErrorBlock>;
  }

  const renderFieldItems = (types: string[]): React.ReactNode[] =>
    types.map((type) => {
      const fieldType = findType(type);

      return fieldType && <FieldItem key={type} fieldType={fieldType} />;
    });

  return (
    <FieldGroup
      button={{
        icon: <EditIcon />,
        title: translate('Edit Manager'),
        onClick: openModal,
      }}
      editionIsPro={config.editions.is(Edition.Pro)}
      title={translate(title)}
    >
      {data.groups.grouped?.map((group) => (
        <GroupWrapper key={group.uid} color={group.color}>
          {group.types.length > 0 && (
            <>
              {group.label && <GroupName>{translate(group.label)}</GroupName>}
              <List>{renderFieldItems(group.types)}</List>
            </>
          )}
        </GroupWrapper>
      ))}

      {data?.types && <List>{renderFieldItems(data.types)}</List>}
    </FieldGroup>
  );
};
