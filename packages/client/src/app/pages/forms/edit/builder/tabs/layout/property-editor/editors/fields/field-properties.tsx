import {
  RenderContextProvider,
  useRenderContext,
} from "@components/form-controls/context/render.context";
import { OpinionScaleProperty } from "@components/form-controls/opinion-scale";
import config from "@config/freeform/freeform.config";
import { SampleDataOptions } from "@editor/builder/sample-data/sample-data-options";
import { useAppDispatch } from "@editor/store";
import { contextActions } from "@editor/store/slices/context";
import { fieldSelectors } from "@editor/store/slices/layout/fields/fields.selectors";
import CloseIcon from "@ff-client/assets/icons/circle-xmark-solid";
import {
  useFetchFieldPropertySections,
  useFieldType,
} from "@ff-client/queries/field-types";
import { Fields } from "@ff-client/types/field.classes";
import type { Property } from "@ff-client/types/properties";
import {
  appearanceDesignHandles,
  cardDesignHandles,
  editableComponentDesign,
  sectionDesignHandles,
  themeDesignHandles,
} from "@ff-client/utils/component-design-settings";
import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";
import type React from "react";
import { useMemo } from "react";
import Skeleton from "react-loading-skeleton";
import { useSelector } from "react-redux";

import { CloseLink, Icon, Title } from "../../property-editor.styles";
import { SectionBlock } from "../../section-block";
import { SectionWrapper } from "../../section-block.styles";

import { FavoriteButton } from "./favorite/favorite.button";
import { FieldComponent } from "./field-component";
import { FieldPropertiesWrapper } from "./field-properties.styles";
import { LayoutDesignGroups } from "./layout-design-groups";

const sectionFilter = (handle: string) => (property: Property) =>
  property.section === handle;

export const FieldProperties: React.FC<{ uid: string }> = ({ uid }) => {
  const dispatch = useAppDispatch();
  const renderContext = useRenderContext();

  const { data: sections, isFetching } = useFetchFieldPropertySections();

  const field = useSelector(fieldSelectors.one(uid));
  const type = useFieldType(field?.typeClass);

  const sectionBlocks: React.ReactElement[] = useMemo(() => {
    const blocks: React.ReactElement[] = [];
    const sampleProperty = type?.properties.find(
      (property) => property.handle === "sampleData",
    );
    const sampleAction =
      type?.type === "opinion-scale" && sampleProperty ? (
        <FieldComponent
          field={field}
          property={sampleProperty}
          control={SampleDataOptions}
        />
      ) : undefined;
    sections
      ?.sort((a, b) => a.order - b.order)
      ?.forEach(({ handle, label, icon }, sectionIndex) => {
        const properties = type?.properties
          .filter(sectionFilter(handle))
          .filter((property) => property.visible);

        if (!properties?.length) {
          return;
        }

        const isLayout = field.typeClass === Fields.Layout;
        const custom =
          isLayout &&
          editableComponentDesign(field.properties).designStyle === "custom";
        const layoutHandles = [
          "preset",
          "columnProportions",
          "gap",
          "customGap",
          "mobile",
          "verticalAlignment",
          "columnStyle",
        ];
        const grouped = [
          ...appearanceDesignHandles,
          ...themeDesignHandles,
          ...layoutHandles,
        ];
        const groups = [
          { label: "Layout", handles: layoutHandles },
          ...(custom
            ? [
                { label: "Section", handles: sectionDesignHandles },
                ...(field.properties.columnStyle === "cards"
                  ? [{ label: "Cards", handles: cardDesignHandles }]
                  : []),
                {
                  label: "Links & Buttons",
                  handles: ["designAccentColor", "designAccentTextColor"],
                },
              ]
            : []),
        ];
        blocks.push(
          <SectionBlock label={translate(label)} icon={icon} key={handle}>
            {properties
              .filter(
                (property) => !isLayout || !grouped.includes(property.handle),
              )
              .map((property, propertyIndex) => (
                <OpinionScaleProperty
                  key={property.handle}
                  typeClass={field.typeClass}
                  property={property}
                  properties={properties}
                  labelAction={sampleAction}
                  renderProperty={(item, control) => (
                    <FieldComponent
                      autoFocus={sectionIndex === 0 && propertyIndex === 0}
                      field={field}
                      property={item}
                      control={control}
                    />
                  )}
                />
              ))}
            {isLayout &&
              properties.some((property) =>
                grouped.includes(property.handle),
              ) && (
                <LayoutDesignGroups
                  key={`${field.uid}:${custom}`}
                  defaultGroup={custom ? "Section" : "Layout"}
                  groups={groups.flatMap((group) => {
                    const items = properties.filter((property) =>
                      group.handles.includes(property.handle),
                    );
                    return items.length
                      ? [
                          {
                            label: group.label,
                            content: items.map((property) => (
                              <FieldComponent
                                key={property.handle}
                                field={field}
                                property={property}
                              />
                            )),
                          },
                        ]
                      : [];
                  })}
                />
              )}
          </SectionBlock>,
        );
      });

    return blocks;
  }, [sections, type, field]);

  if (!field || !type) {
    return <FieldPropertiesWrapper />;
  }

  if (!sections && isFetching) {
    return (
      <FieldPropertiesWrapper>
        <Title>
          <Icon
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(type.icon) }}
          />
          <span>{translate(type.name)}</span>
        </Title>
        <SectionWrapper>
          <Skeleton />
        </SectionWrapper>
      </FieldPropertiesWrapper>
    );
  }

  return (
    <FieldPropertiesWrapper>
      <CloseLink
        aria-label={translate("Close field settings")}
        onClick={() => dispatch(contextActions.unfocus())}
      >
        <CloseIcon />
      </CloseLink>
      {config.limitations.can("layout.favorite") && (
        <FavoriteButton field={field} />
      )}
      <Title>
        <Icon
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(type.icon) }}
        />
        <span>{translate(type.name)}</span>
      </Title>
      <RenderContextProvider
        {...renderContext}
        collapsibleInstructions={
          type.type === "datetime"
            ? type.properties
                .filter((property) => property.instructions)
                .map((property) => property.handle)
            : renderContext.collapsibleInstructions
        }
      >
        <SectionWrapper>{sectionBlocks}</SectionWrapper>
      </RenderContextProvider>
    </FieldPropertiesWrapper>
  );
};
