import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '@components/layout/sidebar/sidebar';
import { SettingsOwnership } from '@editor/builder/tabs/form-settings/settings.ownership';
import { formSelectors } from '@editor/store/slices/form/form.selectors';
import { useQueryFormSettings } from '@ff-client/queries/forms';
import type { FormSettingNamespace } from '@ff-client/types/forms';
import type { Section } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import { hasErrors } from '@ff-client/utils/errors';

import {
  SectionIcon,
  SectionLink,
  SectionWrapper,
} from './settings.sidebar.styles';

export const SettingsSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { sectionHandle } = useParams();

  const formErrors = useSelector(formSelectors.errors);

  const { data } = useQueryFormSettings();
  if (!data) {
    return null;
  }

  let selectedNamespace: FormSettingNamespace;
  let selectedSection: Section;
  const sectionsWithErrors: string[] = [];

  data.forEach((namespace) => {
    namespace.sections.forEach((section) => {
      if (section.handle === sectionHandle) {
        selectedNamespace = namespace;
        selectedSection = section;
      }
    });

    namespace.properties.forEach((prop) => {
      if (hasErrors(formErrors?.[namespace.handle]?.[prop.handle])) {
        if (!sectionsWithErrors.includes(prop.section)) {
          sectionsWithErrors.push(prop.section);
        }
      }
    });
  });

  if (!selectedNamespace || !selectedSection) {
    return null;
  }

  return (
    <Sidebar $lean>
      <SectionWrapper>
        {data.map((namespace) =>
          namespace.sections.map((section) => (
            <SectionLink
              key={section.handle}
              onClick={() => navigate(`${section.handle}`)}
              className={classes(
                sectionHandle === section.handle && 'active',
                sectionsWithErrors.includes(section.handle) && 'errors'
              )}
            >
              <SectionIcon dangerouslySetInnerHTML={{ __html: section.icon }} />
              {section.label}
            </SectionLink>
          ))
        )}
      </SectionWrapper>
      <SettingsOwnership />
    </Sidebar>
  );
};
