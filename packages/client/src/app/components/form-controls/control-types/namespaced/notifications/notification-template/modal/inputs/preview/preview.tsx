import type { FC } from 'react';
import React, { useEffect } from 'react';
import { ControlBlock } from '@components/form-controls/control.block';
import translate from '@ff-client/utils/translations';

import type { InputControl } from '../../template.modal.types';

import { Address } from './components/address';
import { Attachments } from './components/attachments';
import { IframeBlock } from './components/iframe';
import { TemplatePreviewLoader } from './preview.loading';
import { usePreviewQuery } from './preview.queries';
import {
  Body,
  HeaderRow,
  Label,
  PreviewContainer,
  Row,
  Value,
} from './preview.styles';

export const TemplatePreview: FC<InputControl> = (props) => {
  const { inView } = props;
  const { data, isFetching, refetch } = usePreviewQuery(props.context);

  useEffect(() => {
    if (inView) {
      refetch();
    }
  }, [inView]);

  return (
    <ControlBlock {...props}>
      {isFetching && <TemplatePreviewLoader />}
      {data !== undefined && !isFetching && (
        <PreviewContainer>
          <HeaderRow />
          <Row>
            <Label>{translate('To')}:</Label>
            <Value>{data.to}</Value>
          </Row>
          <Row>
            <Label>{translate('Subject')}:</Label>
            <Value>{data.subject}</Value>
          </Row>
          <Row>
            <Label>{translate('From')}:</Label>
            <Value>
              <Address address={data.from} />
            </Value>
          </Row>
          {!!data.cc.length && (
            <Row>
              <Label>{translate('CC')}:</Label>
              <Value>
                <Address address={data.cc} />
              </Value>
            </Row>
          )}
          {!!data.bcc.length && (
            <Row>
              <Label>{translate('BCC')}:</Label>
              <Value>
                <Address address={data.bcc} />
              </Value>
            </Row>
          )}
          {!!data.attachments.length && (
            <Row>
              <Label>{translate('Attachments')}:</Label>
              <Value>
                <Attachments attachments={data.attachments} />
              </Value>
            </Row>
          )}
          <Row>
            <Body>
              <IframeBlock body={data.htmlBody} />
            </Body>
          </Row>
        </PreviewContainer>
      )}
    </ControlBlock>
  );
};
