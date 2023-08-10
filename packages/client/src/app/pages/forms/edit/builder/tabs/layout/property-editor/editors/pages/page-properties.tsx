import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '@editor/store';
import { contextActions } from '@editor/store/slices/context';
import { pageSelecors } from '@editor/store/slices/layout/pages/pages.selectors';
import CloseIcon from '@ff-client/assets/icons/circle-xmark-solid.svg';
import { useFetchPageButtonType } from '@ff-client/queries/page-types';
import type { Property } from '@ff-client/types/properties';

import { CloseLink, Title } from '../../property-editor.styles';
import { SectionBlock } from '../../section-block';
import { SectionWrapper } from '../../section-block.styles';

import { PageComponent } from './page-component';
import { PagePropertiesWrapper } from './page-properties.styles';

type Props = {
  uid: string;
};

const sectionFilter = (handle: string) => (property: Property) =>
  property.section === handle;

export const PageProperties: React.FC<Props> = ({ uid }) => {
  const dispatch = useAppDispatch();

  const page = useSelector(pageSelecors.one(uid));
  const { data, isFetching } = useFetchPageButtonType();

  if (!data && isFetching) {
    return (
      <PagePropertiesWrapper>
        <CloseLink onClick={() => dispatch(contextActions.unfocus())}>
          <CloseIcon />
        </CloseLink>
        <Title>
          <span>{page.label}</span>
        </Title>
        <SectionWrapper style={{ paddingTop: 20 }}>
          <Skeleton height={30} />
          <Skeleton height={30} />
          <Skeleton height={30} />
        </SectionWrapper>
      </PagePropertiesWrapper>
    );
  }

  const sectionBlocks: React.ReactElement[] = [];
  data.sections.forEach(({ handle, label, icon }) => {
    const properties = data.properties.filter(sectionFilter(handle));
    if (!properties.length) {
      return;
    }

    sectionBlocks.push(
      <SectionBlock label={label} icon={icon} key={handle}>
        {properties.map((property) => (
          <PageComponent
            key={property.handle}
            page={page}
            property={property}
          />
        ))}
      </SectionBlock>
    );
  });

  return (
    <PagePropertiesWrapper>
      <CloseLink onClick={() => dispatch(contextActions.unfocus())}>
        <CloseIcon />
      </CloseLink>
      <Title>
        <span>{page.label}</span>
      </Title>
      <SectionWrapper>{sectionBlocks}</SectionWrapper>
    </PagePropertiesWrapper>
  );
};
