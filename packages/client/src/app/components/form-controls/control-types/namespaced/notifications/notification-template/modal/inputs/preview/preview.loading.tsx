import type { FC } from 'react';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import translate from '@ff-client/utils/translations';

import {
  Body,
  HeaderRow,
  Label,
  PreviewContainer,
  Row,
  Value,
} from './preview.styles';

export const TemplatePreviewLoader: FC = () => {
  return (
    <PreviewContainer>
      <HeaderRow />
      <Row>
        <Label>{translate('To')}:</Label>
        <Value>
          <Skeleton width={200} />
        </Value>
      </Row>
      <Row>
        <Label>{translate('Subject')}:</Label>
        <Value>
          <Skeleton width={200} />
        </Value>
      </Row>
      <Row>
        <Label>{translate('From')}:</Label>
        <Value>
          <Skeleton width={200} />
        </Value>
      </Row>
      <Row>
        <Body>
          <Skeleton width={200} />
          <Skeleton width={300} />
          <Skeleton width={550} />
          <br />
          <Skeleton width={500} />
          <Skeleton width={430} />
          <Skeleton width={520} />
          <br />
          <Skeleton width={200} />
          <Skeleton width={230} />
          <Skeleton width={220} />
        </Body>
      </Row>
    </PreviewContainer>
  );
};
