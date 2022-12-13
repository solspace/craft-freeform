import type { PropsWithChildren } from 'react';
import React from 'react';
import type { FormSettingGroup } from '@ff-client/types/forms';
import translate from '@ff-client/utils/translations';

import { GroupContainer, GroupHeader, GroupWrapper } from './group.styles';

type Props = {
  group: FormSettingGroup;
};

export const Group: React.FC<PropsWithChildren<Props>> = ({
  group,
  children,
}) => {
  return (
    <GroupWrapper>
      {!!group?.label && <GroupHeader>{translate(group.label)}</GroupHeader>}
      <GroupContainer>{children}</GroupContainer>
    </GroupWrapper>
  );
};
