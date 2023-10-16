import React from 'react';
import { useParams } from 'react-router-dom';
import { useQueryFormSettings } from '@ff-client/queries/forms';
import type { FormSettingNamespace } from '@ff-client/types/forms';
import type { Section } from '@ff-client/types/properties';

import { FieldComponent } from './field-component';
import {
  FormSettingsContainer,
  SectionContainer,
  SectionHeader,
} from './settings.editor.styles';

export const SettingsEditor: React.FC = () => {
  const { sectionHandle } = useParams();

  const { data } = useQueryFormSettings();
  if (!data) {
    return null;
  }

  let selectedNamespace: FormSettingNamespace;
  let selectedSection: Section;
  data.forEach((namespace) => {
    namespace.sections.forEach((section) => {
      if (section.handle === sectionHandle) {
        selectedNamespace = namespace;
        selectedSection = section;
      }
    });
  });

  if (!selectedNamespace || !selectedSection) {
    return null;
  }

  const { properties } = selectedNamespace;

  return (
    <FormSettingsContainer>
      <SectionHeader>{selectedSection?.label}</SectionHeader>

      <SectionContainer>
        {properties
          .filter((property) => property.section === selectedSection?.handle)
          .map((property) => (
            <FieldComponent
              key={property.handle}
              namespace={selectedNamespace.handle}
              property={property}
            />
          ))}
      </SectionContainer>
    </FormSettingsContainer>
  );
};
