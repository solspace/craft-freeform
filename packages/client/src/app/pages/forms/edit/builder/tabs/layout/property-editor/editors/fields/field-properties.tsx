import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { useSelector } from 'react-redux';
import { FormComponent } from '@components/form-controls';
import { useAppDispatch } from '@editor/store';
import { contextActions } from '@editor/store/slices/context';
import { fieldSelectors } from '@editor/store/slices/layout/fields/fields.selectors';
import { fieldThunks } from '@editor/store/thunks/fields';
import CloseIcon from '@ff-client/assets/icons/circle-xmark-solid.svg';
import {
  useFetchFieldPropertySections,
  useFetchFieldTypes,
  useFieldType,
  useFieldTypeSearch,
} from '@ff-client/queries/field-types';
import { type Property, PropertyType } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import { CloseLink, Icon, Title } from '../../property-editor.styles';
import { SectionBlock } from '../../section-block';
import { SectionWrapper } from '../../section-block.styles';

import { FavoriteButton } from './favorite/favorite.button';
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
    return <FieldPropertiesWrapper />;
  }

  if (!sections && isFetching) {
    return (
      <FieldPropertiesWrapper>
        <Title>
          <Icon dangerouslySetInnerHTML={{ __html: type.icon }} />
          <span>{type.name}</span>
        </Title>
        <SectionWrapper>
          <Skeleton />
        </SectionWrapper>
      </FieldPropertiesWrapper>
    );
  }

  const sectionBlocks: React.ReactElement[] = [];
  sections
    .sort((a, b) => a.order - b.order)
    .forEach(({ handle, label, icon }) => {
      const properties = type.properties.filter(sectionFilter(handle));
      if (!properties.length) {
        return;
      }

      // FIXME - Convert Field Type as a proper field property under advanced section, similar to label, handle required etc
      sectionBlocks.push(
        <SectionBlock label={label} icon={icon} key={handle}>
          {properties.map((property) => (
            <FieldComponent
              key={property.handle}
              field={field}
              property={property}
            />
          ))}
          {handle === 'advanced' && (
            <FormComponent
              value={field.typeClass}
              property={{
                type: PropertyType.Select,
                handle: 'typeClass',
                label: translate('Field type'),
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
                  fieldThunks.change.type(
                    field,
                    searchFieldType(value as string)
                  )
                );
              }}
            />
          )}
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
