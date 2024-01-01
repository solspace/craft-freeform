import React from 'react';
import { ErrorBlock } from '@components/notification-blocks/error/error-block';
import { useFetchGroups } from '@ff-client/queries/groups';
import translate from '@ff-client/utils/translations';
import EditIcon from '@ff-icons/actions/edit.icon.svg';

import { FieldGroup } from '../../field-group/field-group';
import { LoaderFieldGroup } from '../../field-group/field-group.loader';
import { List } from '../../field-group/field-group.styles';

import { useCreateModal } from './modal/use-create-modal';
import { GroupName, GroupWrapper } from './base-fields.styles';
import { FieldItem } from './field-item';

const title = translate('Field Types');

export const BaseFields: React.FC = () => {
  const { data, isFetching, isError, error } = useFetchGroups({});
  const openModal = useCreateModal();

  const unassignedTypes = data?.types
    .map((_, index) => index)
    .filter(
      (index) =>
        !data.groups.hidden.includes(index) &&
        !data.groups.grouped.some((group) => group.types.includes(index))
    );

  if (!data && isFetching) {
    return <LoaderFieldGroup words={[50, 70]} items={16} />;
  }

  if (isError) {
    return <ErrorBlock>{error.message}</ErrorBlock>;
  }

  if (!data) {
    return null;
  }

  return (
    <FieldGroup
      button={{
        icon: <EditIcon />,
        title: translate('Edit Manager'),
        onClick: openModal,
      }}
      title={title}
    >
      {data.groups.grouped?.map((group) => (
        <GroupWrapper key={group.uid} color={group.color}>
          {group.types.length > 0 && (
            <>
              {group.label && <GroupName>{group.label}</GroupName>}
              <List>
                {group?.types?.map((type) => (
                  <FieldItem key={type} typeClass={data.types[type]} />
                ))}
              </List>
            </>
          )}
        </GroupWrapper>
      ))}

      {unassignedTypes && (
        <List>
          {unassignedTypes?.map((type) => (
            <FieldItem key={type} typeClass={data.types[type]} />
          ))}
        </List>
      )}
    </FieldGroup>
  );
};
