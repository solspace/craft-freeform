import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { useSelector } from 'react-redux';
import { FormComponent } from '@components/form-controls';
import { useAppDispatch } from '@editor/store';
import { contextActions } from '@editor/store/slices/context';
import { fieldSelectors } from '@editor/store/slices/fields/fields.selectors';
import { changeFieldType } from '@editor/store/thunks/fields';
import CloseIcon from '@ff-client/assets/icons/circle-xmark-solid.svg';
import {
  useFetchFieldPropertySections,
  useFetchFieldTypes,
  useFieldType,
  useFieldTypeSearch,
} from '@ff-client/queries/field-types';
import { type Property, PropertyType } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import {
  CloseLink,
  Icon,
  SectionBlock,
  SectionWrapper,
  Title,
} from '../../property-editor.styles';

import { FavoriteButton } from './favorite/favorite.button';
import AdvancedIcon from './icons/advanced.svg';
import { FieldComponent } from './field-component';
import { FieldPropertiesWrapper } from './field-properties.styles';

const sectionFilter = (handle: string) => (property: Property) =>
  property.section === handle;

export const FieldProperties: React.FC<{ uid: string }> = ({ uid }) => {
  const dispatch = useAppDispatch();

  const { data: sections, isFetching } = useFetchFieldPropertySections();
  const { data: types } = useFetchFieldTypes();

  const field = useSelector(fieldSelectors.one(uid));
  const type = useFieldType(field?.typeClass);

  const searchFieldType = useFieldTypeSearch();

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
      <SectionWrapper>
        {sectionBlocks}

        <SectionBlock label={translate('Advanced')}>
          <Icon>
            <AdvancedIcon />
          </Icon>
          <FormComponent
            value={field.typeClass}
            property={{
              type: PropertyType.Select,
              handle: 'typeClass',
              label: translate('Type'),
              instructions: translate('Change the type of this field.'),
              options: types.map((type) => ({
                label: type.name,
                value: type.typeClass,
              })),
            }}
            updateValue={(value) => {
              if (
                !confirm(
                  translate(
                    'Are you sure? You might potentially lose important data.'
                  )
                )
              ) {
                return;
              }

              dispatch(
                changeFieldType(field, searchFieldType(value as string))
              );
            }}
          />
        </SectionBlock>
      </SectionWrapper>
    </FieldPropertiesWrapper>
  );
};
