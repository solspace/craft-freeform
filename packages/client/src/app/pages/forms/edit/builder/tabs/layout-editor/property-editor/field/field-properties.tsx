import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { useSelector } from 'react-redux';
import { selectField } from '@ff-client/app/pages/forms/edit/store/slices/fields';
import {
  useFetchFieldPropertySections,
  useFieldType,
} from '@ff-client/queries/field-types';

import {
  Icon,
  SectionBlock,
  SectionWrapper,
  Title,
} from '../property-editor.styles';

import { EditableComponent } from './editable-component';

export const FieldProperties: React.FC<{ uid: string }> = ({ uid }) => {
  const { data: sections, isFetching } = useFetchFieldPropertySections();
  const field = useSelector(selectField(uid));
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

  return (
    <>
      <Title>
        <Icon dangerouslySetInnerHTML={{ __html: type.icon }} />
        <span>{type.name}</span>
      </Title>
      <SectionWrapper>
        {sections.map(({ handle, label }) => (
          <SectionBlock label={label} key={handle}>
            {type.properties
              .filter((property) => property.section === handle)
              .sort((a, b) => a.order - b.order)
              .map((property) => (
                <EditableComponent
                  key={property.handle}
                  field={field}
                  property={property}
                />
              ))}
          </SectionBlock>
        ))}
      </SectionWrapper>
    </>
  );
};
