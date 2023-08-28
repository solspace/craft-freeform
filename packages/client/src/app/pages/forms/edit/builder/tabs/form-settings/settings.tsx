import React, { useEffect } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useQueryFormSettings } from '@ff-client/queries/forms';

import { LoaderFormSettings } from './settings.loader';
import { SettingsSidebar } from './settings.sidebar';
import { FormSettingsWrapper } from './settings.styles';

export const FormSettings: React.FC = () => {
  const { sectionHandle } = useParams();
  const navigate = useNavigate();

  const { data, isFetching } = useQueryFormSettings();

  useEffect(() => {
    if (!sectionHandle) {
      const firstSection = data?.[0]?.sections[0];
      if (firstSection) {
        navigate(`${firstSection.handle}`);
      }
    }
  }, [data, sectionHandle]);

  if (!data && isFetching) {
    return <LoaderFormSettings />;
  }

  return (
    <FormSettingsWrapper>
      <SettingsSidebar />
      <Outlet />
    </FormSettingsWrapper>
  );
};
