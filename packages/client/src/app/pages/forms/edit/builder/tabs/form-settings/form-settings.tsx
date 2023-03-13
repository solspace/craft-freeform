import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '@components/layout/sidebar/sidebar';
import { FieldComponent } from '@editor/builder/tabs/form-settings/field-component';
import { useQueryFormSettings } from '@ff-client/queries/forms';
import classes from '@ff-client/utils/classes';

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

  const [sectionIndex, setSectionIndex] = useState(0);

  useEffect(() => {
    setSectionIndex(0);
  }, [namespace]);

  const generateUpdateHandler = useValueUpdateGenerator(namespace);

  if (!data && isFetching) {
    return <div>Loading...</div>;
  }

  const settingsNamespace = data.find((item) => item.handle === namespace);
  if (!settingsNamespace) {
    return null;
  }

  const { sections, properties } = settingsNamespace;
  const selectedSection = sections[sectionIndex];

  return (
    <FormSettingsWrapper>
      <Sidebar>
        <SectionWrapper>
          {sections.map((section, idx) => (
            <SectionLink
              key={section.handle}
              className={classes(idx === sectionIndex && 'active')}
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
            <FormControlGenerator
              key={property.handle}
              namespace={namespace}
              property={property}
              onValueUpdate={generateUpdateHandler(property)}
            />
          ))}
      </FormSettingsContainer>
    </FormSettingsWrapper>
  );
};
