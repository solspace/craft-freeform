import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@editor/store';
import { contextActions } from '@editor/store/slices/context';
import { fieldSelectors } from '@editor/store/slices/fields/fields.selectors';
import CloseIcon from '@ff-client/assets/icons/circle-xmark-solid.svg';
import {
  useFetchFieldPropertySections,
  useFieldType,
} from '@ff-client/queries/field-types';
import type { Property } from '@ff-client/types/properties';

import {
  CloseLink,
  Icon,
  SectionBlock,
  SectionWrapper,
  Title,
} from '../../property-editor.styles';

import { FavoriteButton } from './favorite/favorite.button';
import { FieldComponent } from './field-component';
import { FieldPropertiesWrapper } from './field-properties.styles';

const sectionFilter = (handle: string) => (property: Property) =>
  property.section === handle;

export const FieldProperties: React.FC<{ uid: string }> = ({ uid }) => {
  const dispatch = useAppDispatch();
  const { data: sections, isFetching } = useFetchFieldPropertySections();
  const field = useSelector(fieldSelectors.one(uid));
  const type = useFieldType(field?.typeClass);

  if (!field || !type) {
    return <div>Not found</div>;
  }

  if (!sections && isFetching) {
    return (
      <div>
        <h2>{type.name}</h2>
        <SectionWrapper>
          <Skeleton />
        </SectionWrapper>
      </div>
    );
  }

  const sectionBlocks: React.ReactElement[] = [];
  sections.forEach(({ handle, label, icon }) => {
    const properties = type.properties.filter(sectionFilter(handle));
    if (!properties.length) {
      return;
    }

    sectionBlocks.push(
      <SectionBlock label={label} key={handle}>
        {!!icon && <Icon dangerouslySetInnerHTML={{ __html: icon }} />}
        {properties
          .sort((a, b) => a.order - b.order)
          .map((property) => (
            <FieldComponent
              key={property.handle}
              field={field}
              property={property}
            />
          ))}
      </SectionBlock>
    );
  });

  return (
    <FieldPropertiesWrapper>
      <CloseLink onClick={() => dispatch(contextActions.unfocus())}>
        <CloseIcon />
      </CloseLink>
      <FavoriteButton field={field} />
      <Title>
        <Icon dangerouslySetInnerHTML={{ __html: type.icon }} />
        <span>{type.name}</span>
      </Title>
      <SectionWrapper>{sectionBlocks}</SectionWrapper>
    </FieldPropertiesWrapper>
  );
};
