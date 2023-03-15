import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Sidebar } from '@components/layout/sidebar/sidebar';
import { selectFormErrors } from '@editor/store/slices/form';
import { useQueryFormSettings } from '@ff-client/queries/forms';
import classes from '@ff-client/utils/classes';
import { hasErrors } from '@ff-client/utils/errors';

import { FieldComponent } from './field-component';
import {
  FormSettingsContainer,
  FormSettingsWrapper,
  SectionHeader,
  SectionIcon,
  SectionLink,
  SectionWrapper,
} from './form-settings.style';

type RouteParams = {
  namespace: string;
};

export const FormSettings: React.FC = () => {
  const { namespace } = useParams<RouteParams>();
  const { data, isFetching } = useQueryFormSettings();

  const formErrors = useSelector(selectFormErrors);

  const [sectionIndex, setSectionIndex] = useState(0);

  useEffect(() => {
    setSectionIndex(0);
  }, [namespace]);

  if (!data && isFetching) {
    return <div>Loading...</div>;
  }

  const settingsNamespace = data.find((item) => item.handle === namespace);
  if (!settingsNamespace) {
    return null;
  }

  const { sections, properties } = settingsNamespace;
  const selectedSection = sections[sectionIndex];

  const sectionsWithErrors: string[] = [];
  properties.forEach((prop) => {
    if (hasErrors(formErrors?.[namespace]?.[prop.handle])) {
      if (!sectionsWithErrors.includes(prop.section)) {
        sectionsWithErrors.push(prop.section);
      }
    }
  });

  return (
    <FormSettingsWrapper>
      <Sidebar lean>
        <SectionWrapper>
          {sections.map((section, idx) => (
            <SectionLink
              key={section.handle}
              className={classes(
                idx === sectionIndex && 'active',
                sectionsWithErrors.includes(section.handle) && 'errors'
              )}
              onClick={() => setSectionIndex(idx)}
            >
              <SectionIcon dangerouslySetInnerHTML={{ __html: section.icon }} />
              {section.label}
            </SectionLink>
          ))}
        </SectionWrapper>
      </Sidebar>
      <FormSettingsContainer>
        <SectionHeader>{selectedSection?.label}</SectionHeader>
        {properties
          .filter((property) => property.section === selectedSection?.handle)
          .map((property) => (
            <FieldComponent
              key={property.handle}
              namespace={namespace}
              property={property}
            />
          ))}
      </FormSettingsContainer>
    </FormSettingsWrapper>
  );
};
