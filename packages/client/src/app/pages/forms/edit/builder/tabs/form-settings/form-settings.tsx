import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Sidebar } from '@components/layout/sidebar/sidebar';
import { formSelectors } from '@editor/store/slices/form/form.selectors';
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

export const FormSettings: React.FC = () => {
  const { data, isFetching } = useQueryFormSettings();

  const formErrors = useSelector(formSelectors.errors);

  const [namespaceIndex, setNamespaceIndex] = useState(0);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [namespace, setNamespace] = useState(null);

  useEffect(() => {
    setNamespace(data[namespaceIndex]?.handle);
  }, [namespaceIndex]);

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
      <Sidebar $lean>
        <SectionWrapper>
          {data
            .sort((a, b) => a.order - b.order)
            .map((namespace, namespaceIdx) =>
              namespace.sections.map((section, sectionIdx) => (
                <SectionLink
                  key={section.handle}
                  className={classes(
                    namespaceIndex === namespaceIdx &&
                      sectionIndex === sectionIdx &&
                      'active',
                    sectionsWithErrors.includes(section.handle) && 'errors'
                  )}
                  onClick={() => {
                    setNamespaceIndex(namespaceIdx);
                    setSectionIndex(sectionIdx);
                  }}
                >
                  <SectionIcon
                    dangerouslySetInnerHTML={{ __html: section.icon }}
                  />
                  {section.label}
                </SectionLink>
              ))
            )}
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
