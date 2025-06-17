import type { FC } from 'react';
import React, { useEffect } from 'react';
import { ControlBlock } from '@components/form-controls/control.block';
import { spacings } from '@ff-client/styles/variables';
import type { APIError } from '@ff-client/types/api';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import type { InputControl } from '../../template.modal.types';

import { Address } from './components/address';
import { Attachments } from './components/attachments';
import { IframeBlock } from './components/iframe';
import { TemplatePreviewLoader } from './preview.loading';
import { usePreviewQuery, useSendTestEmailMutation } from './preview.queries';
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
  const { data, isFetching, refetch, error } = usePreviewQuery(props.context);
  const sendTest = useSendTestEmailMutation();

  useEffect(() => {
    if (inView) {
      refetch();
    }
  }, [inView]);

  return (
    <ControlBlock
      {...props}
      extraContent={
        <div style={{ display: 'flex', gap: spacings.sm }}>
          <button
            className={classes(
              'btn',
              'small',
              'submit',
              isFetching && 'disabled'
            )}
            disabled={isFetching}
            type="button"
            onClick={() => refetch()}
          >
            {translate('Refresh')}
          </button>

          <button
            className={classes(
              'btn',
              'small',
              sendTest.isLoading && 'disabled'
            )}
            disabled={sendTest.isLoading}
            type="button"
            onClick={() => sendTest.mutate(props.context)}
          >
            {translate('Send Test Email')}
          </button>
        </div>
      }
    >
      {isFetching && <TemplatePreviewLoader />}

      {!!error && (
        <PreviewContainer>
          <HeaderRow />
          <Row>
            <Label>{translate('Error')}:</Label>
            <Value>
              <b>{error.message}</b>
            </Value>
          </Row>
          <Row>
            <Body>{(error as APIError).errors.template.preview}</Body>
          </Row>
        </PreviewContainer>
      )}

      {data !== undefined && !error && !isFetching && (
        <PreviewContainer>
          <HeaderRow />
          <Row>
            <Label>{translate('From')}:</Label>
            <Value>
              <Address address={data.from} />
            </Value>
          </Row>
          <Row>
            <Label>{translate('Subject')}:</Label>
            <Value>{data.subject}</Value>
          </Row>
          <Row>
            <Label>{translate('To')}:</Label>
            <Value>{data.to}</Value>
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
