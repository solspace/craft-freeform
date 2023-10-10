import React from 'react';
import { SectionWrapper } from '@editor/builder/tabs/form-settings/settings.sidebar.styles';
import {
  Icon,
  Title,
} from '@editor/builder/tabs/layout/property-editor/property-editor.styles';
import { SectionBlock } from '@editor/builder/tabs/layout/property-editor/section-block';
import {
  useFetchFieldPropertySections,
  useFieldType,
} from '@ff-client/queries/field-types';
import type {
  FieldFavorite,
  PropertyValueCollection,
} from '@ff-client/types/fields';
import type { GenericValue } from '@ff-client/types/properties';
import { type Property } from '@ff-client/types/properties';

import { FavoriteFieldComponent } from './modal.editor.field';

type Props = {
  field: FieldFavorite;
  errors?: Record<string, string[]>;
  values: PropertyValueCollection;
  updateValueCallback: (key: string, value: GenericValue) => void;
};

const sectionFilter = (handle: string) => (property: Property) =>
  property.section === handle;

export const FavoritesEditor: React.FC<Props> = ({
  field,
  errors,
  values,
  updateValueCallback,
}) => {
  const { data: sections } = useFetchFieldPropertySections();
  const type = useFieldType(field?.typeClass);

  if (!field || !type || !sections) {
    return null;
  }

  const sectionBlocks: React.ReactElement[] = [];
  sections
    .sort((a, b) => a.order - b.order)
    .forEach(({ handle, label, icon }) => {
      const properties = type.properties.filter(sectionFilter(handle));
      if (!properties.length) {
        return;
      }

      sectionBlocks.push(
        <SectionBlock label={label} icon={icon} key={handle}>
          {properties.map((property) => (
            <FavoriteFieldComponent
              key={property.handle}
              errors={errors?.[property.handle]}
              state={values}
              siblingProperties={type.properties}
              property={property}
              updateValueCallback={updateValueCallback}
            />
          ))}
        </SectionBlock>
      );
    });

  return (
    <>
      <Title>
        <Icon dangerouslySetInnerHTML={{ __html: type.icon }} />
        <span>{values?.label || type.name}</span>
      </Title>
      <SectionWrapper>{sectionBlocks}</SectionWrapper>
    </>
  );
};
