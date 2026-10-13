import { RenderContextProvider } from "@components/form-controls/context/render.context";
import { OpinionScaleProperty } from "@components/form-controls/opinion-scale";
import { SectionWrapper } from "@editor/builder/tabs/form-settings/settings.sidebar.styles";
import {
  Icon,
  Title,
} from "@editor/builder/tabs/layout/property-editor/property-editor.styles";
import { SectionBlock } from "@editor/builder/tabs/layout/property-editor/section-block";
import {
  useFetchFieldPropertySections,
  useFieldType,
} from "@ff-client/queries/field-types";
import type {
  FieldFavorite,
  PropertyValueCollection,
} from "@ff-client/types/fields";
import type { GenericValue, Property } from "@ff-client/types/properties";
import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";
import type React from "react";

import { FavoriteFieldComponent } from "./modal.editor.field";

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
  const displayName = values?.label || translate(type.name);
  sections
    .sort((a, b) => a.order - b.order)
    .forEach(({ handle, label, icon }) => {
      const properties = type.properties.filter(sectionFilter(handle));
      if (!properties.length) {
        return;
      }

      sectionBlocks.push(
        <SectionBlock label={translate(label)} icon={icon} key={handle}>
          {properties.map((property) => (
            <OpinionScaleProperty
              key={property.handle}
              typeClass={field.typeClass}
              property={property}
              properties={properties}
              renderProperty={(item, control) => (
                <FavoriteFieldComponent
                  errors={errors?.[item.handle]}
                  state={values}
                  siblingProperties={type.properties}
                  property={item}
                  updateValueCallback={updateValueCallback}
                  control={control}
                />
              )}
            />
          ))}
        </SectionBlock>,
      );
    });

  return (
    <>
      <Title>
        <Icon
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(type.icon) }}
        />
        <span
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(displayName),
          }}
        />
      </Title>
      <RenderContextProvider size={"small"}>
        <SectionWrapper>{sectionBlocks}</SectionWrapper>
      </RenderContextProvider>
    </>
  );
};
