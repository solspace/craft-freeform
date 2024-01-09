import React from 'react';
import { useSelector } from 'react-redux';
import { formSelectors } from '@editor/store/slices/form/form.selectors';
import translate from '@ff-client/utils/translations';
import { format } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';

import {
  SectionWrapper,
  SidebarMeta,
  SidebarMetaUserLink,
  SidebarSeperator,
} from './settings.sidebar.styles';

export const SettingsOwnership: React.FC = () => {
  const { ownership } = useSelector(formSelectors.current);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const createdAtDate = utcToZonedTime(new Date(ownership.created.datetime), timezone);
  const updatedAtDate = utcToZonedTime(new Date(ownership.updated.datetime), timezone);

  if (!ownership) {
    return null;
  }

  return (
    <>
      <SidebarSeperator />
      <SectionWrapper>
        <SidebarMeta>
          {ownership.created.user ? (
            <>
              {translate('Created by')}{' '}
              <SidebarMetaUserLink
                href={ownership.created.user.url}
                target="_blank"
              >
                {ownership.created.user.name}
              </SidebarMetaUserLink>
            </>
          ) : (
            translate('Created')
          )}
          &nbsp;
          {translate('at')}:<br /> {format(createdAtDate, 'Pp')}
        </SidebarMeta>

        <SidebarMeta>
          {ownership.updated.user ? (
            <>
              {translate('Last Updated by')}{' '}
              <SidebarMetaUserLink
                href={ownership.updated.user.url}
                target="_blank"
              >
                {ownership.updated.user.name}
              </SidebarMetaUserLink>
            </>
          ) : (
            translate('Last Updated')
          )}
          &nbsp;
          {translate('at')}:<br /> {format(updatedAtDate, 'Pp')}
        </SidebarMeta>
      </SectionWrapper>
    </>
  );
};
