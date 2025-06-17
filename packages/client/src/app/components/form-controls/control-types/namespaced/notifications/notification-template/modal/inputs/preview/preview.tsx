import type { FC } from 'react';
import React, { useEffect, useState } from 'react';
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
  Input,
  Label,
  PreviewContainer,
  Row,
  Value,
} from './preview.styles';

export const TemplatePreview: FC<InputControl> = (props) => {
  const { inView } = props;
  const { data, isFetching, refetch, error } = usePreviewQuery(props.context);
  const sendTest = useSendTestEmailMutation();

  const [email, setEmail] = useState<string>();

  useEffect(() => {
    if (inView) {
      refetch();
    }
  }, [inView]);

  useEffect(() => {
    if (email === undefined && data?.from) {
      const from = Array.isArray(data.from) ? data.from[0] : data.from;
      setEmail(from.address);
    }
  }, [data]);

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

          <Input
            className="small"
            type="text"
            placeholder={translate('john@doe.com')}
            value={email || ''}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            inputMode="email"
            data-lpignore="true"
            data-1p-ignore
          />

          <button
            className={classes(
              'btn',
              'small',
              sendTest.isLoading && 'disabled',
              !email && 'disabled'
            )}
            disabled={sendTest.isLoading || !email}
            type="button"
            onClick={() =>
              sendTest.mutate({
                ...props.context,
                targetEmail: email || '',
              })
            }
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
